// =============================================================
// Learning Hub - Back-End Server (CST3144)
// Node.js + Express
// =============================================================

var express = require("express");
var cors = require("cors");
var path = require("path");

var app = express();

// Allow the front-end (GitHub Pages / Live Preview) to call this server
app.use(cors());

// Lets express read JSON sent in the body of POST requests
app.use(express.json());


// -------------------------------------------------------------
// Lessons data (images are stored in the "images" folder)
// -------------------------------------------------------------
var lessons = [
    { id: 1,  subject: "Mathematics",  location: "Roches Brunes", price: 500, space: 5, image: "mathematics.svg", icon: "fa-solid fa-calculator" },
    { id: 2,  subject: "English",      location: "Phoenix",       price: 450, space: 5, image: "english.svg",     icon: "fa-solid fa-book" },
    { id: 3,  subject: "Science Lab",  location: "Rose Hill",     price: 550, space: 5, image: "science.svg",     icon: "fa-solid fa-flask" },
    { id: 4,  subject: "Music Studio", location: "Flic en Flac",  price: 600, space: 5, image: "music.svg",       icon: "fa-solid fa-music" },
    { id: 5,  subject: "Creative Art", location: "Beau Bassin",   price: 400, space: 5, image: "art.svg",         icon: "fa-solid fa-palette" },
    { id: 6,  subject: "French",       location: "Rose Hill",     price: 450, space: 5, image: "french.svg",      icon: "fa-solid fa-language" },
    { id: 7,  subject: "Coding Club",  location: "Phoenix",       price: 650, space: 5, image: "coding.svg",      icon: "fa-solid fa-code" },
    { id: 8,  subject: "Dance Class",  location: "Quatre Bornes", price: 500, space: 5, image: "dance.svg",       icon: "fa-solid fa-shoe-prints" },
    { id: 9,  subject: "History",      location: "Curepipe",      price: 400, space: 5, image: "history.svg",     icon: "fa-solid fa-hourglass" },
    { id: 10, subject: "Geography",    location: "Roches Brunes", price: 450, space: 5, image: "geography.svg",   icon: "fa-solid fa-globe" }
];

// Orders received from the front-end (kept in memory for now)
var orders = [];


// -------------------------------------------------------------
// A. LOGGER MIDDLEWARE
// Writes every incoming request to the console:
// time, request method (GET/POST...) and the url requested
// -------------------------------------------------------------
app.use(function(request, response, next) {
    var time = new Date().toLocaleString();
    console.log("[" + time + "] " + request.method + " request to " + request.url);
    next();
});


// -------------------------------------------------------------
// GET /lessons  -> returns all lessons as JSON
// -------------------------------------------------------------
app.get("/lessons", function(request, response) {
    response.json(lessons);
});


// -------------------------------------------------------------
// B. STATIC FILE MIDDLEWARE
// /images/maths.svg  -> sends images/maths.svg if it exists
// -------------------------------------------------------------
var imagePath = path.resolve(__dirname, "images");
app.use("/images", express.static(imagePath));

// If express.static did not find the file, we reach this function
app.use("/images", function(request, response) {
    console.log("Image not found: " + request.originalUrl);
    response.status(404).json({ error: "Image not found: " + request.originalUrl });
});


// -------------------------------------------------------------
// POST /orders  -> receives a new order from the front-end
// Expected body: { name, phone, lessonIDs: [1, 1, 4], spaces: 3 }
// -------------------------------------------------------------
app.post("/orders", function(request, response) {
    var order = request.body;

    // Basic check that the order contains what we need
    if (!order || !order.name || !order.phone || !Array.isArray(order.lessonIDs) || order.lessonIDs.length === 0) {
        console.log("Rejected an incomplete order");
        response.status(400).json({ error: "Order must include name, phone and at least one lesson" });
        return;
    }

    order.orderNumber = orders.length + 1;
    orders.push(order);

    // Write a summary of the order to the console
    console.log("------ New order #" + order.orderNumber + " ------");
    console.log("Name:    " + order.name);
    console.log("Phone:   " + order.phone);
    console.log("Lessons: " + order.lessonIDs.join(", "));
    console.log("Spaces:  " + order.lessonIDs.length);
    console.log("--------------------------");

    response.json({ message: "Order received", orderNumber: order.orderNumber });
});


// -------------------------------------------------------------
// 404 for anything else (must be the LAST middleware)
// -------------------------------------------------------------
app.use(function(request, response) {
    response.status(404).send("Page Not Found!");
});


// Render sets PORT for us; on our own computer we use 3000
var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("App started on port " + port);
});
