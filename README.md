# Learn n Learn - Server

Back-end for the Learn n Learn after-school lessons app (CST3144 coursework).
Built with Node.js and Express. Data is stored in MongoDB Atlas using the native MongoDB driver.

Live server: https://cst3144-m00983496-server.onrender.com/lessons

## Run it locally

1. npm install
2. Create a config.env file with MONGODB_PREFIX, MONGODB_USERNAME, MONGODB_PASSWORD and MONGODB_URL
3. node server.js

The server starts on http://localhost:3000

## Routes

| Method | Route | What it does |
|---|---|---|
| GET | /lessons | Returns all lessons |
| POST | /orders | Saves a new order in the orders collection |
| PUT | /lessons/:_id | Updates any field of a lesson, e.g. { "space": 3 } |
| GET | /search?q=text | Searches lessons by topic, location, price or space |
| GET | /enrolment/:lessonid | Returns how many spaces of a lesson have been bought |
| GET | /teachers | Returns all teachers |
| GET | /teachers/:teacherid/lessons | Returns the lessons taught by one teacher |
| GET | /images/:file | Returns a lesson image, or a 404 error if it does not exist |
| any | anything else | Page Not Found! (404) |

## Middleware

- Logger - prints the time, method and URL of every request to the console.
- Static files - serves lesson images from the images folder.

## Database (learninghub)

- lessons - id, topic, location, price, space, image, icon
- orders - name, phone, lessonIDs, spaces
- teachers - id, firstName, lastName, lessonIDs
