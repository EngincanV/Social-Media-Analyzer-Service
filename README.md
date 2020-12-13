# SocialMediaAnalyzerService
Social Media Analyzer Service

# Routes

| Route | HTTP Verb	 | POST body	 | Description	 |
| --- | --- | --- | --- |
| /userInfo | `POST` | { username, password } | Get user info |
| /follower | `POST` | { username, password } | Get followers |
| /following | `POST` | Empty | Get followings |
| /notToBeFollowed | `POST` | { username, password } | Get not to be followed users |
| /userInfoByUsername/:username | `GET` | Empty | Get all user info by username include not to be followed users |
| /account/login | `POST` | { username, password } | Login |
| /account/register | `POST` | { name, surname, username, email, password } | Register |
