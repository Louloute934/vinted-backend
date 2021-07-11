const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userRoutes = require("./route/user");
app.use(userRoutes);
const offerRoutes = require("./route/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(400).json({ message: error.message });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
