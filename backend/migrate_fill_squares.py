import sqlite3
import os
import random

HERE    = os.path.dirname(__file__)
DB_PATH = os.path.join(HERE, "test.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # Load all rooms and their categories
    cur.execute("SELECT id, category FROM rooms")
    rooms = cur.fetchall()

    for room_id, category in rooms:
        # Grab all challenge texts for this room’s category
        cur.execute("SELECT text FROM challenges WHERE category = ?", (category,))
        chals = [row[0] for row in cur.fetchall()]

        if len(chals) < 25:
            print(f"⚠️  Room {room_id} has only {len(chals)} challenges in “{category}”")
        random.shuffle(chals)

        # Update each of the 25 squares, quoting the index column
        for idx in range(25):
            text = chals[idx] if idx < len(chals) else None
            cur.execute(
                'UPDATE squares SET text = ? WHERE room_id = ? AND "index" = ?',
                (text, room_id, idx)
            )

    conn.commit()
    conn.close()
    print("✅ Filled text for all existing squares.")

if __name__ == "__main__":
    main()
