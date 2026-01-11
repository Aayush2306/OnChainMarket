import { db } from "../db";
import { cryptoRounds, cryptoBets, users } from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getCryptoPrice } from "./prices";

const ROUND_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SUPPORTED_CRYPTOS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "AVAX"];

// Get or create current round for a crypto
export async function getCurrentRound(crypto: string) {
  const now = new Date();
  
  // Find active round
  const [activeRound] = await db
    .select()
    .from(cryptoRounds)
    .where(
      and(
        eq(cryptoRounds.crypto, crypto.toUpperCase()),
        lte(cryptoRounds.startTime, now),
        gte(cryptoRounds.endTime, now)
      )
    )
    .limit(1);

  if (activeRound) {
    return activeRound;
  }

  // Create new round
  return createNewRound(crypto.toUpperCase());
}

export async function createNewRound(crypto: string) {
  const now = new Date();
  const endTime = new Date(now.getTime() + ROUND_DURATION_MS);
  
  const price = await getCryptoPrice(crypto);
  
  const [newRound] = await db
    .insert(cryptoRounds)
    .values({
      crypto: crypto.toUpperCase(),
      startPrice: price?.toString() || null,
      startTime: now,
      endTime: endTime,
    })
    .returning();

  return newRound;
}

// Resolve a round
export async function resolveRound(roundId: number) {
  const [round] = await db
    .select()
    .from(cryptoRounds)
    .where(eq(cryptoRounds.id, roundId))
    .limit(1);

  if (!round || round.result) {
    return null; // Already resolved or doesn't exist
  }

  const endPrice = await getCryptoPrice(round.crypto);
  if (!endPrice || !round.startPrice) {
    return null;
  }

  const startPrice = parseFloat(round.startPrice);
  let result: "up" | "down" | "same";
  
  if (endPrice > startPrice) {
    result = "up";
  } else if (endPrice < startPrice) {
    result = "down";
  } else {
    result = "same";
  }

  // Update round with end price and result
  const [updatedRound] = await db
    .update(cryptoRounds)
    .set({
      endPrice: endPrice.toString(),
      result: result,
    })
    .where(eq(cryptoRounds.id, roundId))
    .returning();

  // Process bets
  await processBets(roundId, result);

  return updatedRound;
}

// Process bets for a resolved round
async function processBets(roundId: number, result: string) {
  const bets = await db
    .select()
    .from(cryptoBets)
    .where(
      and(
        eq(cryptoBets.roundId, roundId),
        eq(cryptoBets.status, "pending")
      )
    );

  for (const bet of bets) {
    let status: "won" | "lost" | "refunded";
    let profit = 0;

    if (result === "same") {
      // Refund on tie
      status = "refunded";
      profit = 0;
      
      // Return credits
      await db
        .update(users)
        .set({
          credits: sql`${users.credits} + ${bet.amount}`,
        })
        .where(eq(users.id, bet.userId));
    } else if (bet.direction === result) {
      // Won
      status = "won";
      profit = bet.amount; // 1:1 payout
      
      // Add winnings (original bet + profit)
      await db
        .update(users)
        .set({
          credits: sql`${users.credits} + ${bet.amount * 2}`,
        })
        .where(eq(users.id, bet.userId));
    } else {
      // Lost
      status = "lost";
      profit = -bet.amount;
    }

    await db
      .update(cryptoBets)
      .set({
        status: status,
        profit: profit,
      })
      .where(eq(cryptoBets.id, bet.id));
  }
}

// Get live bets for a round
export async function getLiveBets(roundId: number) {
  const bets = await db
    .select({
      id: cryptoBets.id,
      direction: cryptoBets.direction,
      amount: cryptoBets.amount,
      createdAt: cryptoBets.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
      },
    })
    .from(cryptoBets)
    .leftJoin(users, eq(cryptoBets.userId, users.id))
    .where(eq(cryptoBets.roundId, roundId))
    .orderBy(desc(cryptoBets.createdAt))
    .limit(50);

  return bets;
}

// Start round checker interval
export function startRoundChecker() {
  // Check for rounds to resolve every 10 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find expired rounds that haven't been resolved
      const expiredRounds = await db
        .select()
        .from(cryptoRounds)
        .where(
          and(
            lte(cryptoRounds.endTime, now),
            sql`${cryptoRounds.result} IS NULL`
          )
        )
        .limit(10);

      for (const round of expiredRounds) {
        await resolveRound(round.id);
      }
    } catch (error) {
      console.error("Round checker error:", error);
    }
  }, 10000);

  console.log("Round checker started");
}
