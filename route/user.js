const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.use(formidable());

const User = require("../Model/User");
const Offer = require("../Model/Offer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dlkoztzdz",
  api_key: "426859877595992",
  api_secret: "xJij9yTcpU3RD4wd2R5o3Ts5ryI",
});

router.post("/user/signup", async (req, res) => {
  try {
    const salt = uid2(16);
    const token = uid2(64);
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      if (req.fields.username) {
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: req.files.picture,
          },
          token: token,
          hash: SHA256(req.fields.password + salt).toString(encBase64),
          salt: salt,
        });
        await newUser.save();
        await cloudinary.uploader.upload(req.files.picture.path, {
          folder: `/vinted-final/user/${newUser._id}`,
        });
        res.json({
          _id: newUser.id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
          },
        });
      } else {
        res.json("You have to choose a username");
      }
    } else {
      res.json("email already used");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64
      );
      if (user.hash === newHash) {
        res.json({
          id: user.id,
          token: user.token,
          account: {
            username: user.account.username,
            phone: user.account.phone,
          },
        });
      } else {
        res.status(400).json("Unauthorized");
      }
    } else {
      res.status(400).json("Unauthorized");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
