# backend/migrate_schema.py
import sqlite3, os

HERE    = os.path.dirname(__file__)
DB_PATH = os.path.join(HERE, "test.db")   # adjust if your file is named differently

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

def add_column(table, column_def):
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column_def}")
        print(f"✅ Dodano kolumnę: {table}.{column_def.split()[0]}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"ℹ️  Kolumna już istnieje: {table}.{column_def.split()[0]}")
        else:
            raise

# 1) Add rooms.category (default to 'gym/fitness' so existing rows get a value)
add_column("rooms",  "category TEXT NOT NULL DEFAULT 'gym/fitness'")

# 2) Add squares.text (nullable at first)
add_column("squares","text      TEXT")

# 3) Create the challenges table if it doesn't exist already
cur.execute("""
CREATE TABLE IF NOT EXISTS challenges (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT    NOT NULL,
    text     TEXT    NOT NULL
);
""")
print("✅ Upewniono się, że istnieje tabela challenges")

conn.commit()
conn.close()
print("🎉 Migracje zakończone.")
