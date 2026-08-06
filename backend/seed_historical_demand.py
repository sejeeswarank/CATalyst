"""One-off loader: pushes historical_demand.csv into the Supabase table."""
import os
import sys

import truststore
truststore.inject_into_ssl()  # local HTTPS interception breaks certifi's bundle

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, ".env"))

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
client = create_client(url, key)

csv_path = os.path.join(ROOT, "historical_demand.csv")
df = pd.read_csv(csv_path)
df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

existing = client.table("historical_demand").select("id", count="exact").limit(1).execute()
if existing.count:
    print(f"historical_demand already has {existing.count} rows — nothing to do.")
    sys.exit(0)

rows = df.to_dict(orient="records")
BATCH = 1000
for start in range(0, len(rows), BATCH):
    batch = rows[start : start + BATCH]
    client.table("historical_demand").insert(batch).execute()
    print(f"inserted {start + len(batch)}/{len(rows)}")

print("done")
