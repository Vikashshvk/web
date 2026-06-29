const express = require('express');
const app = express();
const port = 8080; 
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// Database Model - Variable ka naam Capital 'Data' rakhein
const Data = require("./models/data.js");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/Electronicdata";

main()
  .then(() => console.log("Database is connected successfully!"))
  .catch((err) => console.log("Database connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ------------------- ROUTES -------------------

// 1. Test Route (Data Store karne ke liye)
app.get("/testlisting", async (req, res) => {
    try {
        let testlisting = new Data({
            username: "My new village",
            description: "buy the property",
        });
        
        let result = await testlisting.save();
        console.log("Sample was saved:", result);
        res.send("Successful testing! Check your MongoDB Compass.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving test data.");
    }
});

// 2. INDEX ROUTE: Database se saara data lane ke liye
app.get('/posts', async (req, res) => {
    try {
        const posts = await Data.find({}); // MongoDB se saara data fetch karega
        res.render("index.ejs", { posts }); 
    } catch (err) {
        res.status(500).send("Error fetching posts");
    }
});

// 3. NEW ROUTE
app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});

// 4. CREATE ROUTE: Form se data database mein dalne ke liye
const multer  = require('multer');
// Uploaded files kis folder me save hongi (public/uploads)
const upload = multer({ dest: 'public/uploads/' }); 

// CREATE ROUTE ko badal kar aisa karein:
app.post("/posts", upload.single('imageFile'), async (req, res) => {
    try {
        let { username, description } = req.body;
        
        let newPost = new Data({ 
            username, 
            description 
        });

        // Agar user ne file upload ki hai, to uska path save karein
        if(req.file) {
            newPost.image = {
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}` // Local saved path
            };
        }

        await newPost.save();
        res.redirect("/posts");
    } catch (err) {
        console.log(err);
        res.status(400).send("Error creating post with image");
    }
});

// 5. SHOW ROUTE: Kisi ek particular data ko id se dekhne ke liye
app.get("/posts/:id", async (req, res) => {
    try {
        let { id } = req.params; 
        let post = await Data.findById(id); // findById use karein
        if (!post) return res.status(404).send("Post not found");
        res.render("show.ejs", { post });
    } catch (err) {
        res.status(400).send("Invalid ID format");
    }
});

// 6. EDIT ROUTE
app.get("/posts/:id/edit", async (req, res) => {
    try {
        let { id } = req.params; 
        let post = await Data.findById(id);
        res.render("edit.ejs", { post });
    } catch (err) {
        res.status(400).send("Error loading edit page");
    }
});

// 7. UPDATE (PATCH) ROUTE: Database mein data edit karne ke liye
app.patch("/posts/:id", async (req, res) => {
    try {
        let { id } = req.params; 
        let { username, description } = req.body;
        
        await Data.findByIdAndUpdate(id, { username, description }, { runValidators: true });
        res.redirect("/posts");
    } catch (err) {
        res.status(400).send("Error updating post");
    }
});

// 8. DELETE ROUTE: Database se remove karne ke liye
app.delete("/posts/:id", async (req, res) => {
    try {
        let { id } = req.params; 
        await Data.findByIdAndDelete(id);
        res.redirect("/posts");
    } catch (err) {
        res.status(400).send("Error deleting post");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});