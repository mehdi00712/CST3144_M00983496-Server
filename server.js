// Learning Hub - back-end server (CST3144)

var express = require("express");
var cors = require("cors");
var path = require("path");

// load the database details from config.env (not on github)
require("dotenv").config({ path: "./config.env" });

// MongoDB connection setup
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_PREFIX +
    process.env.MONGODB_USERNAME + ":" +
    process.env.MONGODB_PASSWORD +
    process.env.MONGODB_URL;

const client = new MongoClient(uri);
const db = client.db("learninghub");

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("Could not connect to MongoDB");
        console.dir(err);
    }
}

connectToMongoDB();

var app = express();

app.use(cors());
app.use(express.json());


// logger - prints every request to the console
app.use(function(request, response, next) {
    var time = new Date().toLocaleString();
    console.log("[" + time + "] " + request.method + " request to " + request.url);
    next();
});


// GET all lessons from the database
app.get("/lessons", async function(request, response) {
    try {
        let collection = db.collection("lessons");
        let results = await collection.find({}).toArray();
        response.send(results);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not get lessons" });
    }
});


// GET enrolment - how many spaces of a lesson have been bought
app.get("/enrolment/:lessonid", async function(request, response) {
    let lessonId = parseInt(request.params.lessonid);

    // the id has to be a number
    if (isNaN(lessonId)) {
        response.status(400).json({ error: "Lesson id must be a number" });
        return;
    }

    try {
        // check the lesson exists
        let lesson = await db.collection("lessons").findOne({ id: lessonId });
        if (!lesson) {
            response.status(404).json({ error: "Lesson not found" });
            return;
        }

        // get every order that has this lesson in it
        let orders = await db.collection("orders").find({ lessonIDs: lessonId }).toArray();

        // count how many times the lesson appears (an order can have it more than once)
        let enrolment = 0;
        for (let order of orders) {
            for (let id of order.lessonIDs) {
                if (id === lessonId) {
                    enrolment++;
                }
            }
        }

        response.json({ lessonId: lessonId, topic: lesson.topic, enrolment: enrolment });
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not get enrolment" });
    }
});

// GET search - searches topic, location, price and space
// e.g. /search?q=rose
app.get("/search", async function(request, response) {
    let searchText = (request.query.q || "").trim().toLowerCase();

    try {
        let lessons = await db.collection("lessons").find({}).toArray();

        // nothing typed, send back all the lessons
        if (searchText === "") {
            response.json(lessons);
            return;
        }

        // keep the lessons where any field contains the search text
        let results = lessons.filter(function(lesson) {
            return String(lesson.topic).toLowerCase().includes(searchText) ||
                String(lesson.location).toLowerCase().includes(searchText) ||
                String(lesson.price).includes(searchText) ||
                String(lesson.space).includes(searchText);
        });

        response.json(results);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not search lessons" });
    }
});

// GET all teachers
app.get("/teachers", async function(request, response) {
    try {
        let teachers = await db.collection("teachers").find({}).toArray();
        response.json(teachers);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not get teachers" });
    }
});


// GET the lessons taught by one teacher, e.g. /teachers/2/lessons
app.get("/teachers/:teacherid/lessons", async function(request, response) {
    let teacherId = parseInt(request.params.teacherid);

    if (isNaN(teacherId)) {
        response.status(400).json({ error: "Teacher id must be a number" });
        return;
    }

    try {
        let teacher = await db.collection("teachers").findOne({ id: teacherId });
        if (!teacher) {
            response.status(404).json({ error: "Teacher not found" });
            return;
        }

        // find every lesson whose id is in the teacher's lessonIDs
        let lessons = await db.collection("lessons").find({ id: { $in: teacher.lessonIDs } }).toArray();
        response.json(lessons);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not get the teacher's lessons" });
    }
});

// static files - lesson images from the images folder
var imagePath = path.resolve(__dirname, "images");
app.use("/images", express.static(imagePath));

// if the image does not exist
app.use("/images", function(request, response) {
    console.log("Image not found: " + request.originalUrl);
    response.status(404).json({ error: "Image not found: " + request.originalUrl });
});


// POST a new order - saves it in the orders collection
app.post("/orders", async function(request, response) {
    var order = request.body;

    // check the order has everything
    if (!order || !order.name || !order.phone || !Array.isArray(order.lessonIDs) || order.lessonIDs.length === 0) {
        console.log("Rejected an incomplete order");
        response.status(400).json({ error: "Order must include name, phone and at least one lesson" });
        return;
    }

    try {
        let collection = db.collection("orders");
        let result = await collection.insertOne(order);

        // summary of the order in the console
        console.log("New order saved: " + order.name + ", " + order.phone +
            ", lessons " + order.lessonIDs.join(", ") + ", spaces " + order.spaces);

        response.send(result);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not save the order" });
    }
});


// PUT - update any field of a lesson, e.g. { "space": 3 }
app.put("/lessons/:_id", async function(request, response) {
    // check the id is a valid mongodb id
    if (!ObjectId.isValid(request.params._id)) {
        response.status(400).json({ error: "Invalid lesson id" });
        return;
    }

    try {
        let collection = db.collection("lessons");
        const query = { _id: new ObjectId(request.params._id) };
        const updates = {
            $set: request.body
        };

        let result = await collection.updateOne(query, updates);
        console.log("Lesson " + request.params._id + " updated: " + JSON.stringify(request.body));
        response.send(result);
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: "Could not update the lesson" });
    }
});

// 404 for anything else (has to be last)
app.use(function(request, response) {
    response.status(404).send("Page Not Found!");
});


// render gives us PORT, on my computer it uses 3000
var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("App started on port " + port);
});