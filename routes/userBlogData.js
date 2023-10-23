const express = require('express');
const router = express.Router();
//use env file
require('dotenv').config();
const userBlogData = require('../models/userBlogData.js');
const GoogleUser = require('../models/Googleuser');
const cloudinary = require('cloudinary').v2;
const fileupload=require('express-fileupload');

router.use(fileupload({
  useTempFiles:true
}));
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });
cloudinary.config({
  cloud_name: "dnbjbsbzs",
  api_key: "234235216497426",
  api_secret: "PrPzz58Dioikd8hjxi8Xla-3JLA"
});

  router.post('/upload/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log(userId);
  
      // Destructure title and body from the request body
      const { title, body } = req.body;
  
      // Get the user via userId
      const user = await GoogleUser.findById(userId);
  
      // Check if the user exists
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Fetch user details
      const email = user.email;
      const fullname = user.fullname;
  
      // Try to upload the file to Cloudinary
      const file = req.files.photo;
      cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        if (err) {
          // Handle upload error
          console.error(err);
          return res.status(500).send('Error uploading file to Cloudinary');
        }
  
        // If the upload is successful
        console.log(result);
        const imgUrl = result.url;
  
        // Create an object with the image URL and other details
        const obj = {
          imageUrl: imgUrl,
          email: email,
          fullname: fullname,
          userId: userId,
          title: title,
          body: body,
        };
  
        console.log(obj);
        const item = await userBlogData.create(obj);
        // Send a success response
        res.status(200).send('File Uploaded Successfully');
      });
    } catch (err) {
      // Handle other errors, such as database lookup or unexpected errors
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.get('/fetch/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Check if the user exists
      const user = await GoogleUser.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Fetch all data for the specified user
      const userData = await userBlogData.find({ userId: userId });
      console.log(userData)
      // Send the data as a response
      res.status(200).json(userData);
    } catch (err) {
      // Handle errors, such as database lookup or unexpected errors
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
// create an api to get all the blogs
router.get('/fetchall', async (req, res) => {
  try {
    const allData = await userBlogData.find();
    res.status(200).json(allData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;

//create an api to delete a blog
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await userBlogData.findByIdAndDelete(id);
    res.status(200).send('Blog deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


//create an api to update a blog
router.put('/update/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, body } = req.body;
    const file = req.files ? req.files.photo : null; // Check if req.files exists

    const updates = {}; // Create an empty object to collect updates

    if (file) {
      // Handle image upload if a file is provided
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      const imgUrl = result.url;
      updates.imageUrl = imgUrl;
    }

    // Check if title and body are provided
    if (title) {
      updates.title = title;
    }
    if (body) {
      updates.body = body;
    }

    // Perform the update using await
    const updatedData = await userBlogData.findByIdAndUpdate(id, updates);

    if (!updatedData) {
      return res.status(404).send('Blog not found');
    }

    console.log(updatedData);
    if (file) {
      res.status(200).send('Blog updated successfully with image');
    } else {
      res.status(200).send('Blog updated successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});