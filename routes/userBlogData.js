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
  
  // router.post('/upload/:userId', async (req, res,next) => {
  //   const userId = req.params.userId;
  //   try {
  //     const file=req.files.photo;
  //     cloudinary.uploader.upload(file.tempFilePath, async(err,result)=>{
  //       if(err) throw err;
  //       console.log(result);
  //     });

  //     res.send("File Uploaded Successfully"); 

  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error: ');

  //   }
  // });
  
module.exports = router;

// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');


// Multer configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now());
//   },
// });

// const upload = multer({ storage: storage });

// Routes for userBlogData
// router.get('/getdata/:userId', async (req, res) => {
//     try {
//       const userId = req.params.userId; // Extract the user's _id from the URL parameter
//       if (!userId) {
//         return res.status(400).send('User ID is missing in the URL parameter');
//       }
//       console.log(userId)
//       // Find data associated with the specified user's _id
//       const data = await userBlogData.find({ userId: userId });
//       if (!data || data.length === 0) {
//         return res.status(404).send('No data found for the specified user');
//       }
  
//       // Map the data to a new format based on the object you provided
//       const formattedData = data.map(item => ({
//         img: {
//           data: item.img.data,
//           contentType: item.img.contentType,
//         },
//         email: item.email,
//         fullname: item.fullname,
//         userId: userId,
//         user: item.user,
//         title: item.title,
//         body: item.body,
//       }));
      
  
//       // Render the formatted data or send it as a JSON response
//       // Here, it's sent as JSON
//       res.json({ items: formattedData });
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     }
//   });
  

  // router.post('/upload/:userId', upload.single('image'), async (req, res) => {
  //   const userId = req.params.userId;
  
  //   try {
  //     const user = await GoogleUser.findById(userId);
  //     if (!user) {
  //       return res.status(404).send('User not found');
  //     }
  
  //     // Define the correct file path based on your project structure
  //     const filePath = path.join(__dirname, '../uploads', req.file.filename);
  
  //     const obj = {
  //       img: {
  //         data: fs.readFileSync(filePath), // Use the correct file path
  //         contentType: 'image/png',
  //       },
  //       email: user.email,
  //       fullname: user.fullname,
  //       userId: userId,
  //       title: req.body.title,
  //       body: req.body.body,
  //     };
  
  //     const item = await userBlogData.create(obj);
  //     res.render('getData', { userId: userId });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error: ' + error);

  //   }
  // });