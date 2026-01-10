"""
Manually create the first crypto round
Run this once after deployment to kickstart betting
"""
import psycopg2
import psycopg2.extras
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

CRYPTO_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "BNB": "binancecoin",
    "MATIC": "matic-network",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
    "AVAX": "avalanche-2"
}

def get_crypto_prices():
    """Fetch current crypto prices from CoinGecko"""
    api_key = os.environ.get('CG_API_KEY')
    ids = ",".join(CRYPTO_MAP.values())

    url = f"https://api.coingecko.com/api/v3/simple/price"
    params = {
        'ids': ids,
        'vs_currencies': 'usd',
        'x_cg_demo_api_key': api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    # Convert back to symbol keys
    prices = {}
    for symbol, gecko_id in CRYPTO_MAP.items():
        if gecko_id in data and 'usd' in data[gecko_id]:
            prices[symbol] = {"usd": data[gecko_id]['usd']}

    return prices

def create_rounds():
    """Create first round for all cryptos"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    print("🚀 Fetching current crypto prices...")
    prices = get_crypto_prices()

    print(f"✅ Got prices for {len(prices)} cryptos")

    current_time = int(time.time())
    round_start = current_time
    round_end = current_time + 900  # 15 minutes

    created_count = 0

    for symbol, price_data in prices.items():
        price = price_data['usd']

        cursor.execute(
            "INSERT INTO rounds (crypto, start_price, start_time, end_time) VALUES (%s, %s, %s, %s) RETURNING id",
            (symbol, price, round_start, round_end)
        )
        round_id = cursor.fetchone()['id']

        print(f"✅ Created round #{round_id} for {symbol} at ${price}")
        created_count += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n🎉 Successfully created {created_count} rounds!")
    print("💡 Users can now start betting!")

if __name__ == "__main__":
    print("=" * 50)
    print("Creating First Crypto Rounds")
    print("=" * 50)
    create_rounds()
