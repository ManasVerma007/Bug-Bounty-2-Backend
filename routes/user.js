const { Router } = require("express");
const GoogleUser = require("../models/Googleuser");
const { validateToken } = require("../services/authentication");

const router = Router();


router.post("/googlesignin", async (req, res) => {
  const { fullname, email } = req.body;
  try {
    const user = await GoogleUser.findOne({ email });
    if (!user) {
      const newgoogleUser = await GoogleUser.create({
        email,
        fullname,
      });
    }
    const token = await GoogleUser.GenerateToken(fullname, email);

    console.log(token)
    return res.status(200).json({ message: "Token generated", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getuserdetail/", (req, res) => {
  const { token } = req.query;
  // Extract the 'token' parameter from the URL query string
  console.log(token)
  try {
    const userPayload = validateToken(token);
    // Send the user information as a JSON response
    res.json(userPayload);
  } catch (error) {
    // Set the HTTP response status to 400 (Bad Request)
    res.status(400);
    res.json({ error: "Invalid token" });
  }
});

//create api for logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out" });
});

module.exports = router;
