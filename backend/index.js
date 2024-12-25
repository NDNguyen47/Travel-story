require("dotenv").config();



const config = require("./config.json");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const upload = require("./multer")
const fs = require("fs")
const path = require("path")

const { authenticateToken } = require("./utilities")

const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");
const { error } = require("console");


mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

});

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));



const validateUserInput = (req) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return { error: true, message: "Please fill in all fields" };
    }
    return { error: false };
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);

};

const validateLoginInput = (req) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return { error: true, message: "Email and password are required" };
    }
    return { error: false };
};

// create
app.post("/create-account", async (req, res) => {
    const validation = validateUserInput(req);
    if (validation.error) {

        return res.status(400).json(validation);
    }
    const { fullName, email, password } = req.body;
    const isUser = await User.findOne({ email });
    if (isUser) {
        return res
            .status(400)
            .json({ error: true, message: "User already exists" });
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({
        fullName,
        email,
        password: hashedPassword,

    });
    await user.save();
    const accessToken = jwt.sign(
        {
            userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );
    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken,
        message: "Account created successfully",
    });

});


//  Login
app.post("/login", async (req, res) => {
    const validation = validateLoginInput(req);
    if (validation.error) {
        return res.status(400).json(validation);
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
    }
    const user = await User.findOne({ email });
    if (!user) {

        return res

            .status(404)

            .json({ error: true, message: "User does not exist" });

    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {

        return res.status(400).json({ message: "Invalid credentials" });

    }
    const accessToken = jwt.sign(
        {
            userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );
    return res.status(200).json({
        error: false,
        message: "Logged in successfully",
        user: { fullName: user.fullName, email: user.email },
        accessToken,

    });

});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const isUser = await User.findById({ _id: userId });
    if (!isUser) {

        return res.sendStatus(401);

    }
    return res.json({
        user: isUser,
        message: "",
    });

});

// route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: true, message: "No image uploaded" });
        }
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`
        res.status(200).json({ imageUrl })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
});

//Delete imamge 
app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: true, message: "imageUrl parameter is required" });
    }

    try {
        //extract the filename form  the imageUrl
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: true, message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

//Serve the static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/assets", express.static(path.join(__dirname, "assets")))


app.post("/add-travel-story", authenticateToken, async (req, res) => {
    try {
        const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
        const { userId } = req.user;

        if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
            return res.status(400).json({ error: true, message: "Please fill all fields" });
        }

        const parsedVisitedDate = new Date(parseInt(visitedDate));

        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate
        });

        await travelStory.save();

        res.status(201).json({ story: travelStory, message: "Add Successfully" });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});
//Get all Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const travelStories = await TravelStory.find({ userId: userId }).sort({ isFavourite: -1 });
        res.status(200).json({ stories: travelStories })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // validate
    if (!title || !story || !visitedLocation || !visitedDate ) {
        return res.status(400).json({ error: true, message: "Please fill all fields" });
    }
    //convert visitedDate to miliseconds to Date Object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel Story not found" })
        }
        const placeholderImgUrl = `http://localhost:8000/assets/placeholder.png`

        travelStory.title = title
        travelStory.story = story
        travelStory.visitedLocation = visitedLocation
        travelStory.imageUrl = imageUrl || placeholderImgUrl
        travelStory.visitedDate = parsedVisitedDate

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update Successfully" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }

});

// Delete Travel Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

        if (!travelStory) {
            return res
                .status(404)
                .json({ error: true, message: "Travel Story not found" })
        }
        //delete travel story
        await travelStory.deleteOne({ _id: id, userId: userId });

        //Extract the filename from the imageUrl
        const imageUrl = travelStory.imageUrl
        const filename = path.basename(imageUrl)

        //Define the file path
        const filePath = path.join(__dirname, "uploads", filename)

        //Delete the image file from  the uploads folder
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log("Failed to delete image file: ", err);
            }
        });

        res.status(200).json({ message: "Travel story deleted successfully" })
    } catch (error) {
        res.status(500).json({
            error: true, message: error.message
        });
    }

});

// Update isFavourite
app.put("/update-isFavourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { isFavourite } = req.body;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel Story not found" });
        }
        travelStory.isFavourite = isFavourite

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Travel story updated successfully" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
});

// Search travel stories
app.get("/search/", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const { userId } = req.user
    if (!query) {
        return res.status(404).json({ error: true, message: "query is required" });
    }
    try {
        const searchResult = await TravelStory.find({
            userId: userId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { story: { $regex: query, $options: 'i' } },
                { visitedLocation: { $regex: query, $options: 'i' } },
            ],
        }).sort({ isFavourite: -1 })
        res.status(200).json({ stories: searchResult })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
});

// Filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    const { userId } = req.user

    try {

        // convert
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));
        //find travel
        const filteredStories = await TravelStory.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end }// filter by date range
        }).sort({ isFavourite: -1 });
        res.status(200).json({ stories: filteredStories })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }

})


const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
module.exports = app;