const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const connectDB = require("./db/db");
const authRouter = require("./routes/authRoute");
const path = require("path")
// const fileUpload = require("express-fileupload");
const reviewRouter = require("./routes/reviewRoute");
const invoiceRoute = require("./routes/invoiceRoute");
const promotionRoute = require("./routes/promotionRoute");
const bookingRoute = require("./routes/bookingRoute");
const ratePlanRoute = require("./routes/ratePlanRoute");
const hotelRouter = require("./routes/hotelRoute");
const dashboardRouter = require("./routes/dashboardRoutes");
const roomRouter = require("./routes/roomRoute");
const inboxRoute = require("./routes/inboxRoute");
const ticketRoutes = require("./routes/ticketRoute");
require("dotenv").config({ path: ".env"});

const  config  = require("./config/config");
var cors = require('cors')

// app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(cors());


app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.removeHeader("X-Powered-By");
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
// app.use("/auth", authRouter); // Make sure to use the correct path here
// routes
app.use("/auth", authRouter); 
app.use("/review", reviewRouter); 
app.use("/invoice", invoiceRoute);
app.use("/promotion", promotionRoute);  
app.use("/rateplan", ratePlanRoute);
app.use("/hotel", hotelRouter); // Adding the hotelRouter route
app.use("/room", roomRouter);
app.use("/reservation", bookingRoute);
app.use("/inbox", inboxRoute);
app.use('/tickets', ticketRoutes);
app.use("/dashboard", dashboardRouter);

connectDB();
app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
