# Learning Hub – Server

Back-end for the Learning Hub after-school lessons app (CST3144 coursework), built with Node.js and Express.

## Run it

```
npm install
node server.js
```

The server starts on http://localhost:3000

## Routes

| Method | Route | What it does |
|---|---|---|
| GET | `/lessons` | Returns all lessons as JSON |
| GET | `/images/<file>` | Returns a lesson image, or a 404 error message if it doesn't exist |
| POST | `/orders` | Receives a new order (`name`, `phone`, `lessonIDs`) and logs a summary |
| any | anything else | `Page Not Found!` (404) |

## Middleware

- **Logger** – prints the time, method and URL of every request to the console.
- **Static files** – serves lesson images from the `images` folder.
