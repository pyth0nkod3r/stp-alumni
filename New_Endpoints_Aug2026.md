# Blazing Connect — New Endpoints (August 2026)

**Base URL:** `https://api.blazingtorrent.org/api`

> ⚠️ All endpoints below are on the NEW server. Update your env var:
> `NEXT_PUBLIC_API_URL = https://api.blazingtorrent.org/api`

---

## 1. Event Edit (Owner or Admin)

```
PATCH /api/events/:eventId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (all fields optional):**
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "type": "online,in-person",
  "startTime": "2026-09-15T09:00:00",
  "endTime": "2026-09-15T17:00:00",
  "timeZone": "Africa/Lagos",
  "externalLink": "https://zoom.us/xxx",
  "address": "1 Victoria Island",
  "venue": "Eko Hotel",
  "capacity": 100
}
```

**Response:**
```json
{ "status": true, "message": "Event updated successfully", "data": { "eventId": "evt_xxx" } }
```

---

## 2. Event Delete (Owner or Admin)

```
DELETE /api/events/:eventId
Authorization: Bearer <token>
```

**Response:**
```json
{ "status": true, "message": "Event deleted successfully" }
```

---

## 3. Event Registrants (Owner or Admin)

```
GET /api/events/:eventId/registrants
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "userId": "uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "location": "Lagos, Nigeria",
      "status": "REGISTERED",
      "registeredAt": "2026-08-24 10:00:00"
    }
  ],
  "total": 5
}
```

---

## 4. In-App Notifications

### Get Notifications
```
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "notificationId": "notif_xxx",
      "type": "CONNECTION_REQUEST",
      "title": "New Connection Request",
      "message": "John Doe sent you a connection request.",
      "data": { "connectionId": "uuid", "senderId": "uuid" },
      "isRead": false,
      "createdAt": "2026-08-24 10:00:00"
    }
  ],
  "pagination": { "currentPage": 1, "perPage": 20, "totalItems": 10, "totalPages": 1 }
}
```

**Notification types:**
- `CONNECTION_REQUEST` — someone sent you a connection request
- `CONNECTION_ACCEPTED` — your connection request was accepted
- `POST_LIKE` — someone liked your post
- `POST_COMMENT` — someone commented on your post
- `EVENT_UPDATE` — an event you registered for was updated

### Unread Count (for badge)
```
GET /api/notifications/unread-count
Authorization: Bearer <token>
```
```json
{ "status": true, "data": { "unreadCount": 5 } }
```

### Mark Single Notification Read
```
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

### Mark All Read
```
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

---

## 5. Support

### Submit Support Message (User)
```
POST /api/support
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{
  "subject": "Login Issue",
  "message": "I cannot login to my account"
}
```
`name` and `email` are auto-filled from logged-in user.

**Response:**
```json
{ "status": true, "message": "Support message submitted successfully", "data": { "supportId": "sup_xxx" } }
```

### Get Support Messages (Admin)
```
GET /api/backoffice/support?status=UNREAD&page=1&limit=20
Authorization: Bearer <admin token>
```
Status options: `UNREAD` | `READ` | `RESOLVED`

### Unread Support Count (for badge)
```
GET /api/backoffice/support/unread-count
Authorization: Bearer <admin token>
```
```json
{ "status": true, "data": { "unreadCount": 3 } }
```

### Mark Support Message
```
PATCH /api/backoffice/support/:supportId
Authorization: Bearer <admin token>
Content-Type: application/json
```
```json
{ "status": "RESOLVED" }
```
Values: `READ` | `RESOLVED`

---

## 6. Report Post

```
POST /api/posts/:postId/report
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{
  "reason": "Spam",
  "description": "Optional additional details"
}
```

**Response:**
```json
{ "status": true, "message": "Post reported successfully", "data": { "reportId": "rep_xxx" } }
```

---

## 7. Admin Post Moderation

### Get Reported Posts
```
GET /api/backoffice/posts/reported?page=1&limit=20
Authorization: Bearer <admin token>
```

### Hide Post
```
PATCH /api/backoffice/posts/:postId/hide
Authorization: Bearer <admin token>
```

### Unhide Post
```
PATCH /api/backoffice/posts/:postId/unhide
Authorization: Bearer <admin token>
```

### Delete Post
```
DELETE /api/backoffice/posts/:postId
Authorization: Bearer <admin token>
```

---

## 8. Suggested Connections

```
GET /api/connections/suggested?limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "byLocation": [
      {
        "userId": "uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "location": "Lagos, Nigeria",
        "title": "CEO",
        "companyName": "Acme Ltd",
        "profileImagePath": "https://api.blazingtorrent.org/uploads/profile-images/xxx.jpg",
        "sector": ["Technology", "Fintech"]
      }
    ],
    "byRole": [ ...same format ]
  }
}
```

---

## 9. Deal Room Members (Admin)

```
GET /api/backoffice/dealrooms/:roomId/members
Authorization: Bearer <admin token>
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "userId": "uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "location": "Lagos, Nigeria",
      "title": "CEO",
      "companyName": "Acme Ltd",
      "joinedAt": "2026-08-13 12:20:40"
    }
  ],
  "total": 4
}
```

---

## 10. Edit User (Admin)

```
PATCH /api/backoffice/users/:userId
Authorization: Bearer <admin token>
Content-Type: application/json
```
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "cohort": "2023"
}
```
All fields optional — only send what needs updating.

---

## 11. Marketplace Filters (Updated)

```
GET /api/public/marketplace?role=USER&cohort=2023&sector=Technology&search=john&page=1&limit=20
Authorization: Bearer <token>
```

All filters optional and combinable. Response includes `pagination` object.

**Search** matches: first name, last name, email, role, userId.

---

## KEY REMINDER

⚠️ **WebSocket stays on Azure:**
```
ws://app.gfa-tech.com:8080
```

✅ **All REST API calls go to Bluehost:**
```
https://api.blazingtorrent.org/api
```

