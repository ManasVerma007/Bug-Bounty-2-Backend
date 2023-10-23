const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoute = require("./routes/user"); // Assuming you have a user route
const path = require('path'); // Import the 'path' module
const fileupload=require('express-fileupload');
const userBlogRoutes = require('./routes/userBlogData');
const cookieParser = require("cookie-parser");
const {
    checkForAuthenticationCookie,
} = require("./middlewares/authentication");

require('dotenv').config();

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use("/user", userRoute); // Assuming you have a user route
app.use("/userBlogData", userBlogRoutes); // Use the userBlogRoutes middleware at '/userBlogData' route
app.use(fileupload({
    useTempFiles:true
}));
// app.use(cors())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow any origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views")); // set views for error and 404 pages

app.get('/', (req, res) => {
  res.render('imagePage'); // Renders the "home.ejs" file
});

const port = process.env.PORT || '3000';
app.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log('Server listening on port', port);
});
