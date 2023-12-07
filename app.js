const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/db");
const authRouter = require("./routes/authRoute");
const  config  = require("./config/config");
// env file config

// middleWare's
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// testing api route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
app.use("/api", authRouter); // Make sure to use the correct path here

// start server and DB
connectDB();
app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
