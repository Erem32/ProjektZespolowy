# backend/migrate_add_columns.py
import sqlite3
import os

# Ścieżka do bazy w katalogu backend
HERE = os.path.dirname(__file__)
DB_PATH = os.path.join(HERE, "test.db")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

def add_column(table, column_def):
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column_def}")
        print(f"✅ Dodano kolumnę: {table}.{column_def.split()[0]}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"ℹ️  Kolumna już istnieje: {table}.{column_def.split()[0]}")
        else:
            raise

# Dodajemy kolor do users (tekst, może być null)
add_column("users", "color TEXT")

# Dodajemy password do rooms (tekst, non-null, domyślnie pusty)
add_column("rooms", "password TEXT NOT NULL DEFAULT ''")

conn.commit()
conn.close()
print("Migracje zakończone.")
