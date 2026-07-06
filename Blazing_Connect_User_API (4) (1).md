# Blazing Connect — User API Reference

**Base URL:** `https://app.gfa-tech.com/stp/api`  
**Auth:** Add `Authorization: Bearer <token>` to every request except Auth endpoints.

---

## AUTH

### Register
`POST /auth/register`
```json
{ "firstName": "John", "lastName": "Doe", "emailAddress": "john@example.com", "password": "Pass123@" }
```

### Login
`POST /auth/login`
```json
{ "emailAddress": "john@example.com", "password": "Pass123@" }
```
After login, route the user based on the response:
```
passwordChangeRequired = true  →  Change Password page
isOnboarded = false            →  Onboarding/KYC page
else                           →  Dashboard
```

### Forgot Password
`POST /auth/forgot-password`
```json
{ "emailAddress": "john@example.com" }
```

### Verify Reset Token
`POST /auth/verify-reset-token`
```json
{ "token": "token-from-email" }
```

### Reset Password
`POST /auth/reset-password`
```json
{ "token": "token-from-email", "newPassword": "NewPass123@" }
```

> ⚠️ After reset, redirect to **Login** only. Do NOT clear `isOnboarded` or route to KYC.

---

## PROFILE

### Get My Profile
`GET /users/profile`

### Setup Profile — KYC (first time only)
`POST /users/profile/setup` — multipart/form-data
```
sector[]        = Technology
location        = Lagos, Nigeria
skills[]        = Product Management
linkedInProfile = https://linkedin.com/in/johndoe
goals           = Scale my startup
cohort          = 2023
profileImage    = <file>   (JPG, PNG, WEBP — max 5MB)
companyName     = Acme Corp
```
> After setup completes, response includes `"passwordChangeRequired": true`.  
> Route user to Change Password before dashboard.  
> ⚠️ `cohort` cannot be changed after this step.

### Update Profile
`PUT /users/profile`
```json
{
  "personal": {
    "title": "CEO",
    "location": "Accra, Ghana",
    "sector": ["Fintech"],
    "skills": ["Fundraising"]
  },
  "business": {
    "companyName": "New Ventures Ltd",
    "elevatorPitch": "We are building...",
    "companyStage": "Series A",
    "businessModel": "B2B"
  }
}
```

### Upload Profile Picture
`POST /users/profile/avatar` — multipart/form-data
```
profileImage = <file>   (JPG, PNG, WEBP — max 5MB)
```

### Change Password
`POST /users/profile/change-password`
```json
{ "oldPassword": "OldPass123@", "newPassword": "NewPass456@" }
```

### View Another User's Profile
`GET /users/:userId/profile`

`connectionStatus` values in response:
- `OWN` — your own profile
- `ACCEPTED` — connected
- `PENDING` — request pending
- `null` — not connected

### Deactivate My Account
`DELETE /users/me`

---

## CONNECTIONS

### Browse Network
`GET /connections/network?search=John&sector=Technology&location=Lagos&cohort=2023`

### Send Connection Request
`POST /connections`
```json
{ "userId": "target-user-uuid" }
```

### View Incoming Requests
`GET /connections/requests`

### Accept Request
`PUT /connections/:connectionId/accept`

### Ignore Request
`PUT /connections/:connectionId/ignore`

### My Connections
`GET /connections`

### Disconnect
`DELETE /connections/:connectionId`

---

## POSTS (Social Feed)

### Get Feed
`GET /posts?page=1&limit=20&search=keyword`

Each post includes:
- `likeCount`, `commentCount`, `hasUserLiked`, `isSaved`
- `connectionStatus` — `OWN` | `ACCEPTED` | `PENDING` | `null`

### Create Post
`POST /posts` — multipart/form-data
```
body         = My post content
postImages[] = <file>   (optional, multiple)
```

### Get Single Post
`GET /posts/:postId`

### Edit Post
`PUT /posts/:postId`
```json
{ "body": "Updated content" }
```

### Delete Post
`DELETE /posts/:postId`

### Like / Unlike
`POST /posts/:postId/like`

### Comment
`POST /posts/:postId/comment`
```json
{ "comment": "Great post!" }
```

### Get Comments
`GET /posts/:postId/comments?page=1&limit=20`

### Save / Unsave
`POST /posts/:postId/save`

### My Saved Posts
`GET /users/saved-posts`

---

## NEWSFEED (Admin Publications — read only)

### Get Newsfeed
`GET /newsfeed?category=Finance&search=keyword&page=1&limit=20`

### Get Single Post
`GET /newsfeed/:postId`

### Like
`POST /newsfeed/:postId/like`

### Comment
`POST /newsfeed/:postId/comment`
```json
{ "comment": "Very insightful!" }
```

### Get Comments
`GET /newsfeed/:postId/comments`

### Save
`POST /newsfeed/:postId/save`

---

## EVENTS

### Get All Events
`GET /events`

Returns:
- **PUBLIC** events (backoffice-created) — visible to everyone
- **CONNECTIONS_ONLY** events — only visible to creator's connections

### Get Single Event
`GET /events/:eventId`

### Create Event
`POST /events` — multipart/form-data
```
name         = West Africa Founders Summit
description  = Annual gathering...
type         = online
format       = virtual
startTime    = 2025-09-15T09:00:00
endTime      = 2025-09-15T17:00:00
timeZone     = Africa/Lagos
externalLink = https://zoom.us/...
address      = 1 Victoria Island
venue        = Eko Hotel
coverImage   = <file>
```
> Response message: *"Only your connections can see this event. Contact backoffice to make it public."*  
> Show this as a disclaimer/toast after creation.

### Register for Event
`POST /events/:eventId/register`

### Cancel Registration
`DELETE /events/:eventId/register`

### My Registered Events
`GET /events/mine`

Returns all events the user has registered for.

### View Event Registrants (creator only)
`GET /events/:eventId/registrants`

Returns names, emails, and profile URLs of all registrants.

> **Reminders:** Registered users automatically get email reminders 3 days before, 2 days before, and on the day of the event.

---

## GROUPS

### Browse Groups
`GET /network/groups`

### Get Single Group
`GET /network/groups/:groupId`

Returns group info + `isMember` + `memberRole`.

### Create Group
`POST /network/groups` — multipart/form-data
```
name        = West Africa Founders
description = A group for founders...
privacyMode = PUBLIC
thumbnail   = <file>   (optional)
```
> Goes live instantly. Creator is automatically admin.

### Update Group (admin only)
`PATCH /network/groups/:groupId`
```json
{ "name": "New Name", "description": "Updated description" }
```

### Join / Leave
`POST /network/groups/:groupId/member`
```json
{ "action": "JOIN" }
```

### My Membership Status
`GET /network/groups/:groupId/member`

### Get Members
`GET /network/groups/:groupId/members`

### Promote Member to Admin
`POST /network/groups/:groupId/promote`
```json
{ "userId": "member-uuid" }
```

### Remove Member (admin only)
`DELETE /network/groups/:groupId/members/:userId`

### Generate Invite Link
`POST /network/groups/:groupId/invite-link`

### Join via Invite Link
`POST /network/groups/join-via-link`
```json
{ "token": "invite-token" }
```

### View Join Requests (admin only)
`GET /network/groups/:groupId/requests`

### Respond to Join Request (admin only)
`POST /network/groups/:groupId/requests/:requestId/respond`
```json
{ "action": "approve" }
```

### Like Group
`POST /network/groups/:groupId/like`

### Comment on Group
`POST /network/groups/:groupId/comment`
```json
{ "comment": "Great community!" }
```

### Get Group Comments
`GET /network/groups/:groupId/comments`

### Report Group
`POST /network/groups/:groupId/reports`
```json
{ "reason": "SPAM", "description": "Posting spam links" }
```
Reason options: `SPAM` `HARASSMENT` `HATE_SPEECH` `MISINFORMATION` `INAPPROPRIATE_CONTENT` `OTHER`

---

## GROUP POSTS FEED

### Get Posts in Group
`GET /network/groups/:groupId/posts?page=1&limit=20`

Each post includes `likeCount`, `commentCount`, `hasUserLiked`.

### Create Post in Group
`POST /network/groups/:groupId/posts` — multipart/form-data
```
body         = My group update
postImages[] = <file>   (optional)
```
> Must be a group member to post.

### Like a Group Post
`POST /network/groups/:groupId/posts/:postId/like`

### Comment on a Group Post
`POST /network/groups/:groupId/posts/:postId/comment`
```json
{ "comment": "Great post!" }
```

### Get Comments on a Group Post
`GET /network/groups/:groupId/posts/:postId/comments?page=1&limit=20`

---

## DEAL ROOMS

### My Deal Rooms
`GET /dealrooms`

### Create Deal Room
`POST /dealrooms`
```json
{ "roomName": "Series A Negotiations", "roomDescription": "Confidential discussions" }
```
> Creator is auto-added as member and NDA auto-signed. Backoffice is notified.

### Get Room Details
`GET /dealrooms/:roomId`

### Get NDA Text
`GET /dealrooms/nda-text`

Call before showing the NDA modal. No room ID needed.

### Sign NDA
`POST /dealrooms/:roomId/nda-signatures`

Must sign before uploading files.

### Add Members (creator or admin only)
`POST /dealrooms/:roomId/members`
```json
{ "members": ["userId1", "userId2"] }
```
> Returns `"0 member(s) added"` if all users are already members — this is NOT an error.

### Remove Member (creator or admin only)
`DELETE /dealrooms/:roomId/members/:userId`

### Get Messages
`GET /dealrooms/:roomId/messages?page=1&limit=30`

### Send Message
`POST /dealrooms/:roomId/messages`
```json
{ "content": "I reviewed the term sheet." }
```

### Upload File (any type, max 50MB)
`POST /dealrooms/:roomId/files` — multipart/form-data
```
file = <any file>
```
Returns `fileUrl`, `originalName`, `type`, `streamUrl` (videos only).

### View All Files in Room
`GET /dealrooms/:roomId/files`

Returns all files uploaded in the room. Members only.
```json
{
  "messageId": "drf_abc123",
  "mediaOriginalName": "report.pdf",
  "fileUrl": "https://...",
  "type": "file",
  "isVideo": false,
  "streamUrl": null,
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-06-04 11:51:37"
}
```

### Stream Video
`GET /dealrooms/:roomId/files/:fileId/stream`

Use directly in a `<video>` tag.

### Delete Message
`DELETE /dealrooms/:roomId/messages/:messageId`

### View Audit Log (creator only)
`GET /dealrooms/:roomId/audit-log`

---

## MESSAGING

### Start Direct Message
`POST /messaging/direct/start`
```json
{ "recipientId": "user-uuid" }
```
> Must be connected to the user first.

### Get All Conversations
`GET /messaging/conversations`

### Get Messages
`GET /messaging/conversations/:conversationId/messages?page=1&limit=30`

### Send Message
`POST /messaging/conversations/:conversationId/messages`
```json
{ "content": "Hey!" }
```

### Send Media/File
`POST /messaging/conversations/:conversationId/media` — multipart/form-data
```
mediaFile = <file>
```
Size limits: images 5MB · video 50MB · audio 10MB · files 20MB  
> ⚠️ Do NOT set `Content-Type` manually. Let the browser set it.

### Mark as Read
`POST /messaging/conversations/:conversationId/read`

### Delete Message
`DELETE /messaging/messages/:messageId`

---

## RESOURCES

### Get Resources
`GET /resources?category=Finance&search=keyword`

Returns all resources — both user-uploaded and backoffice-published.

### Upload Resource
`POST /resources` — multipart/form-data
```
title        = 2024 Market Report
description  = Annual overview...
category     = Research
resourceFile = <file>   (PDF, DOCX, XLSX, PPTX, CSV, images, MP4, WEBM — max 50MB)
```

### Download
`POST /resources/download/:resourceId`

### Stream Video
`GET /resources/:resourceId/stream`

---

## SEARCH

### Global Search
`GET /search?q=keyword&type=all&page=1&limit=10`

`type` options: `all` `people` `posts` `newsfeed` `events` `groups`

**People results include:**
- `connectionStatus` — `ACCEPTED` | `PENDING_SENT` | `PENDING_RECEIVED` | `null`

**Group results include:**
- `isMember` — `true` | `false`

---

## WEBSOCKET

**URL:** `wss://app.gfa-tech.com/ws`

### Authenticate immediately after connecting
```javascript
ws.send(JSON.stringify({ type: "auth", token: "<JWT>" }))
// Response: { type: "authenticated", userId: "...", message: "Connected as John Doe" }
```

### Send
```javascript
// Direct message
{ type: "message", conversationId: "...", content: "Hello!" }

// Deal room message
{ type: "dealroom_message", roomId: "...", content: "Reviewed." }

// Typing
{ type: "typing", conversationId: "..." }
{ type: "dealroom_typing", roomId: "..." }

// Mark read
{ type: "read", conversationId: "..." }
{ type: "dealroom_read", roomId: "..." }
```

### Receive
```javascript
{ type: "new_message",      conversationId, messageId, content, senderId, senderName, createdAt }
{ type: "dealroom_message", roomId, messageId, content, senderId, senderName, createdAt }
{ type: "typing",           conversationId, userId, name }
{ type: "read_receipt",     conversationId, userId, readAt }
{ type: "presence",         userId, status: "online" | "offline" }
```

---

## RESPONSE FORMAT

```json
{ "status": true, "message": "Success", "data": {} }
```

Errors:
```json
{ "status": false, "message": "What went wrong", "error": "ERROR_CODE" }
```

| Code | Meaning |
|---|---|
| 400 | Bad request / validation |
| 401 | Not authenticated |
| 403 | No permission |
| 404 | Not found |
| 500 | Server error |

---

## COMMON MISTAKES

| Mistake | Fix |
|---|---|
| Setting `Content-Type: application/json` on file uploads | Remove it — let browser set it automatically |
| Using wrong field name for image | Must be `profileImage` exactly |
| Routing to KYC after password reset | Only check `isOnboarded` from login response, not from reset flow |
| Treating `"0 member(s) added"` as an error | It means they're already members — show info toast, not error |
| Using `/api/v1/` prefix | Correct prefix is `/api/` only |
