import { sql } from "drizzle-orm";
import { index, integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

// Crypto rounds table - 5-minute betting rounds
export const cryptoRounds = pgTable("crypto_rounds", {
  id: serial("id").primaryKey(),
  crypto: varchar("crypto", { length: 10 }).notNull(),
  startPrice: numeric("start_price", { precision: 20, scale: 8 }),
  endPrice: numeric("end_price", { precision: 20, scale: 8 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  result: varchar("result", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crypto bets table
export const cryptoBets = pgTable("crypto_bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roundId: integer("round_id").notNull().references(() => cryptoRounds.id),
  crypto: varchar("crypto", { length: 10 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  profit: integer("profit").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_crypto_bets_user").on(table.userId),
  index("idx_crypto_bets_round").on(table.roundId),
]);

// On-chain rounds table (pump.fun metrics, etc.)
export const onchainRounds = pgTable("onchain_rounds", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  startValue: numeric("start_value", { precision: 20, scale: 2 }),
  endValue: numeric("end_value", { precision: 20, scale: 2 }),
  referenceValue: numeric("reference_value", { precision: 20, scale: 2 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  result: varchar("result", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// On-chain bets table
export const onchainBets = pgTable("onchain_bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roundId: integer("round_id").notNull().references(() => onchainRounds.id),
  category: varchar("category", { length: 50 }).notNull(),
  prediction: varchar("prediction", { length: 10 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  profit: integer("profit").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_onchain_bets_user").on(table.userId),
  index("idx_onchain_bets_round").on(table.roundId),
]);

// Custom bet rounds table (user-created Solana token bets)
export const customBetRounds = pgTable("custom_bet_rounds", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  tokenCa: varchar("token_ca", { length: 50 }).notNull(),
  tokenName: varchar("token_name", { length: 100 }),
  tokenSymbol: varchar("token_symbol", { length: 20 }),
  startPrice: numeric("start_price", { precision: 30, scale: 15 }),
  endPrice: numeric("end_price", { precision: 30, scale: 15 }),
  startMcap: numeric("start_mcap", { precision: 20, scale: 2 }),
  durationMinutes: integer("duration_minutes").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  result: varchar("result", { length: 10 }),
  totalPool: integer("total_pool").default(0),
  creatorEarnings: integer("creator_earnings").default(0),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom bets table
export const customBets = pgTable("custom_bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roundId: integer("round_id").notNull().references(() => customBetRounds.id),
  prediction: varchar("prediction", { length: 10 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  profit: integer("profit").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_custom_bets_user").on(table.userId),
  index("idx_custom_bets_round").on(table.roundId),
]);

// Type exports
export type CryptoRound = typeof cryptoRounds.$inferSelect;
export type InsertCryptoRound = typeof cryptoRounds.$inferInsert;

export type CryptoBet = typeof cryptoBets.$inferSelect;
export type InsertCryptoBet = typeof cryptoBets.$inferInsert;

export type OnchainRound = typeof onchainRounds.$inferSelect;
export type InsertOnchainRound = typeof onchainRounds.$inferInsert;

export type OnchainBet = typeof onchainBets.$inferSelect;
export type InsertOnchainBet = typeof onchainBets.$inferInsert;

export type CustomBetRound = typeof customBetRounds.$inferSelect;
export type InsertCustomBetRound = typeof customBetRounds.$inferInsert;

export type CustomBet = typeof customBets.$inferSelect;
export type InsertCustomBet = typeof customBets.$inferInsert;
