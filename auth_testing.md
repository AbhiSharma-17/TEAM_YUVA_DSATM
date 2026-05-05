# Chameleon Auth Testing Playbook

## Test User & Session Setup

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'analyst@chameleon.test',
  name: 'Test Analyst',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
"
```

## Endpoints
- `POST /api/auth/session` — body `{session_id}`, sets `session_token` cookie
- `GET /api/auth/me` — returns user via cookie or Bearer header
- `POST /api/auth/logout` — clears session

## Browser test
```python
await page.context.add_cookies([{
  "name": "session_token", "value": SESSION_TOKEN,
  "domain": "...", "path": "/", "httpOnly": True, "secure": True, "sameSite": "None"
}])
await page.goto(URL)
```
