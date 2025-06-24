import sqlite3
import os

# adjust this if your DB file is named differently
HERE    = os.path.dirname(__file__)
DB_PATH = os.path.join(HERE, "test.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    challenges = [
      # 25 gym/fitness
      ("gym/fitness","Do 10 push-ups"),
      ("gym/fitness","Run 1 km"),
      ("gym/fitness","Hold a plank for 1 minute"),
      ("gym/fitness","Do 20 squats"),
      ("gym/fitness","Complete 15 burpees"),
      ("gym/fitness","30-second wall sit"),
      ("gym/fitness","10 lunges per leg"),
      ("gym/fitness","15 sit-ups"),
      ("gym/fitness","20 mountain climbers"),
      ("gym/fitness","10 tricep dips"),
      ("gym/fitness","Jump rope for 2 minutes"),
      ("gym/fitness","25 jumping jacks"),
      ("gym/fitness","5-minute yoga stretch"),
      ("gym/fitness","15 bicycle crunches"),
      ("gym/fitness","20 calf raises"),
      ("gym/fitness","5 pull-ups (or assisted)"),
      ("gym/fitness","30-second side plank (each side)"),
      ("gym/fitness","10 reverse lunges per leg"),
      ("gym/fitness","20 Russian twists"),
      ("gym/fitness","10 hip bridges"),
      ("gym/fitness","1 minute high-knees"),
      ("gym/fitness","5 push-ups with shoulder taps"),
      ("gym/fitness","10 squat jumps"),
      ("gym/fitness","2-minute wall handstand (against wall)"),
      ("gym/fitness","15 downward-dog to cobra transitions"),
      # 25 sightseeing
      ("sightseeing","Take a photo of a local statue"),
      ("sightseeing","Visit a museum"),
      ("sightseeing","Find a street mural"),
      ("sightseeing","Try a local food dish"),
      ("sightseeing","Snap a picture of a historic building"),
      ("sightseeing","Discover a hidden alley"),
      ("sightseeing","Photograph a church or temple"),
      ("sightseeing","Visit a park"),
      ("sightseeing","Take a photo at a viewpoint"),
      ("sightseeing","Find a street musician"),
      ("sightseeing","Visit a landmark fountain"),
      ("sightseeing","Eat at a street-food vendor"),
      ("sightseeing","Ride public transportation"),
      ("sightseeing","Snap a picture of a bridge"),
      ("sightseeing","Attend a local market"),
      ("sightseeing","Photograph a distinctive door"),
      ("sightseeing","Visit an old library"),
      ("sightseeing","Find a local café"),
      ("sightseeing","Photograph the sunset"),
      ("sightseeing","Discover a community garden"),
      ("sightseeing","Visit a historic monument"),
      ("sightseeing","Take a guided walking tour"),
      ("sightseeing","Capture a nighttime cityscape"),
      ("sightseeing","Find a public sculpture"),
    ]

    cur.executemany(
        "INSERT INTO challenges (category, text) VALUES (?, ?)",
        challenges
    )
    conn.commit()
    print(f"✅ Seeded {len(challenges)} challenges.")
    conn.close()

if __name__ == "__main__":
    main()
