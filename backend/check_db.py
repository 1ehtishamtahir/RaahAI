import sqlite3
conn = sqlite3.connect('D:/1-Projects/RaahAI - Bano Qabil Hackathon/RaahAI/backend/raahai.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t[0]}")
    count = cursor.fetchone()[0]
    print(f"  {t[0]}: {count} rows")
    if count > 0 and count <= 5:
        cursor.execute(f"SELECT * FROM {t[0]} LIMIT 2")
        rows = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]
        for row in rows:
            print(f"    {dict(zip(cols, row))}")
conn.close()
