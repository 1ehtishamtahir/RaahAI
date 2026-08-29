import requests

login_resp = requests.post('http://localhost:8000/api/citizen/login', json={'email': 'test@example.com', 'password': 'test1234'})
token = login_resp.json().get('token', '')
headers = {'Authorization': f'Bearer {token}'}

tests = [
    'Show my vehicles',
    'What challans do I have?',
    'Show my pending payments',
    'What documents do I need for passport renewal?',
    'What is my passport status and what documents do I need?',
    'Hello',
    'Show my vehicles',  # no auth
]

for q in tests:
    use_auth = q != 'Show my vehicles' or tests.index(q) < 6
    h = headers if use_auth else {}
    r = requests.post('http://localhost:8000/chat', json={'query': q, 'lang': 'en'}, headers=h)
    data = r.json()
    safe = data.get('answer', '').encode('ascii', 'ignore').decode('ascii').strip()
    grounded = data.get('grounded', False)
    sources = len(data.get('citations', []))
    print(f'Q: {q}')
    print(f'  Grounded: {grounded} | Sources: {sources}')
    print(f'  A: {safe[:300]}')
    print()
