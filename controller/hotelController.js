// controllers/hotelController.js
const Hotel = require("../model/hotelSchema");
const multerConfigs = require("../middleWare/multerConfig");
const nodemailer = require("nodemailer");

// Create a SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: "587",
  auth: {
    user: "suvatrip1@gmail.com",
    pass: "aHSmbLgWfVqr54Uy",
  },
});

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    console.log(hotels, "hotels");
    console.log();
    if (!hotels) {
      return res.status(404).json({ error: "Hotel not found!" });
    }
    if (req.isHotelAccess) {
      return res.json({
        status: true,
        message: "Hotel data fetched successfully",
        data: hotels,
        isHotelAccess: true,
      });
    } else {
      return res.json({
        status: true,
        message: "Hotel data fetched successfully",
        data: hotels,
        isHotelAccess: false,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHotel = async (req, res) => {
  const { uploadPicture } = multerConfigs;
  console.log(req.user, "req.body");

  uploadPicture(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send("Error uploading files.");
    }

    let facilities = {
      accommodation: JSON.parse(req.body.facility).accommodation
        ? JSON.parse(req.body.facility).accommodation
        : [],
      recreation: JSON.parse(req.body.facility).recreation
        ? JSON.parse(req.body.facility).recreation
        : [],
      connectivity: JSON.parse(req.body.facility).connectivity
        ? JSON.parse(req.body.facility).connectivity
        : [],
    };

    let ammenities = {};

    if (req.body.ammenities) {
      ammenities = {
        bathroom: JSON.parse(req.body.ammenities).bathroom
          ? JSON.parse(req.body.ammenities).bathroom
          : [],
        inRoom: JSON.parse(req.body.ammenities).inRoom
          ? JSON.parse(req.body.ammenities).inRoom
          : [],
      };
    } else {
      ammenities = {
        bathroom: [],
        inRoom: [],
      };
    }

    let data = {
      contactNo: JSON.parse(req.body.contactDetails).contactNo,
      country: req.body.country,
      city: req.body.city,
      ...JSON.parse(req.body.basicDetails),
      facilities: facilities,
      ammenities: ammenities,
      hotelRules: JSON.parse(req.body.hotelRules),
      paymentPolicy: JSON.parse(req.body.paymentPolicy),
      parking: JSON.parse(req.body.parking),
      transportation: JSON.parse(req.body.transportation),
      description: req.body.description,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      address: req.body.address,
      state: req.body.state,
      zipCode: req.body.zipCode,
    };

    const pictureLinks = req.files["picture"].map((file, index) => ({
      link: `${process.env.HOST}${
        ":" + process.env.PORT
      }/uploads/propertyPicture/${file.filename}`,
      main: req.body.main ? req.body.main[index] : false,
    }));
    const roomPictureLinks = req.files["roomPicture"].map((file, index) => ({
      link: `${process.env.HOST}${":" + process.env.PORT}/uploads/roomPicture/${
        file.filename
      }`,
      main: req.body.roomMain ? req.body.roomMain[index] : false,
    }));
    const areaPictureLinks = req.files["areaPicture"].map((file, index) => ({
      link: `${process.env.HOST}${":" + process.env.PORT}/uploads/areaPicture/${
        file.filename
      }`,
      main: req.body.areaMain ? req.body.areaMain[index] : false,
    }));
    const taxDocumentLinks = req.files["taxFile"].map((file) => ({
      link: `${process.env.HOST}${
        ":" + process.env.PORT
      }/uploads/documents/tax/${file.filename}`,
    }));

    const propertyDocumentLinks = req.files["propertyFile"].map((file) => ({
      link: `${process.env.HOST}${
        ":" + process.env.PORT
      }/uploads/documents/property/${file.filename}`,
    }));

    try {
      const hotel = new Hotel({
        ...data,
        roomsNo: JSON.parse(req.body.roomSetup).modalData.length,
        propertyPicture: pictureLinks,
        roomPicture: roomPictureLinks,
        areaPicture: areaPictureLinks,
        taxFile: taxDocumentLinks,
        propertyFile: propertyDocumentLinks,
        vendor_id: req.user.id,
      });

      const newHotel = await hotel.save();

      console.log(req.user.email);

      const mailOptions = {
        from: "suvatrip1@gmail.com",
        to: req.user.email,
        subject: "Registration Successful",
        text: "Hello,\n\nYour registration was successful. Welcome aboard!",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.json({
        status: true,
        message: "Hotel created successfully",
        data: newHotel,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
};

// Function to filter hotels based on location
exports.filterHotels = async (req, res) => {
  try {
    const { location, startDate, endDate, children, room, adult } = req.query;

    // Validate and sanitize input
    if (!location || typeof location !== "string") {
      return res.status(400).json({ error: "Invalid location parameter" });
    }

    // Trim leading and trailing whitespaces from the location
    const sanitizedLocation = location.trim();

    // Check if the location is not an empty string after trimming
    if (!sanitizedLocation) {
      return res
        .status(400)
        .json({ error: "Location parameter cannot be empty" });
    }

    // Decode and convert start and end dates to Date objects
    const decodedStartDate = new Date(decodeURIComponent(startDate));
    const decodedEndDate = new Date(decodeURIComponent(endDate));

    // Function to format time in HH:mm
    const formatTime = (date) => {
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // Format check-in and check-out times
    const checkInTime = formatTime(decodedStartDate);
    const checkOutTime = formatTime(decodedEndDate);

    // Perform the search based on location, startDate, endDate, children, room, and adult
    const filteredHotels = await Hotel.find({
      country: { $regex: new RegExp(`^${sanitizedLocation}$`, "i") },
      roomsNo: { $gte: room },
      'hotelRules.allowChildren': children === 'yes',
      'hotelRules.checkInData.from': { $lte: checkInTime },
      'hotelRules.checkInData.until': { $gte: checkInTime },
      'hotelRules.checkOutData.from': { $lte: checkOutTime },
      'hotelRules.checkOutData.until': { $gte: checkOutTime },
    }).populate({
      path: 'rooms',
      match: { noOfRooms: { $gte: room } }, 
    });

    res.status(200).json({
      status: true,
      message: "Hotel data fetched successfully",
      data: filteredHotels,
    });
  } catch (error) {
    console.error("Error filtering hotels:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// exports.getHotelById = async (req, res) => {
//   try {
//     const { id } = req.user;

//     const { fields } = req.query;

//     let query = Hotel.findOne({ vendor_id: id });
//     //  console.log(query , "query");
//     if (fields) {
//       const fieldsArray = fields.split(",");
//       query = query.select(fieldsArray.join(" "));
//     }

//     const hotels = await query.exec();

//     if (!hotels) {
//       return res.status(404).json({ error: "Hotel not found!" });
//     }

//     console.log("hello")
//     console.log(hotels, "hotelData")

//     res.json({

//       message: "Hotel data fetched successfully",
//       data: hotels,
//        success: true,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;

    let query = Hotel.findOne({ _id: id });
    //  console.log(query , "query");
    if (fields) {
      const fieldsArray = fields.split(",");
      query = query.select(fieldsArray.join(" "));
    }

    const hotels = await query.exec();

    if (!hotels) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    // console.log("hello")
    // console.log(hotels, "hotelData")

    res.json({
      message: "Hotel data fetched successfully",
      data: hotels,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateHotel = async (req, res) => {
  const allowedFields = [
    "UUID",
    "vendor_id",
    "propertyName",
    "contactNo",
    "country",
    "city",
    "address",
    "propertyType",
    "roomsNo",
    "currency",
    "photos",
    "facilities",
    "hotelRules",
    "paymentPolicy",
    "parking",
    "latitude",
    "longitude",
    "promoted",
    "ammenities",
    "description",
  ];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid fields in request!" });
  }

  try {
    const hotel = await Hotel.findOneAndUpdate(
      { vendor_id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    res.json({
      status: true,
      message: "Hotel data updated successfully",
      data: hotel,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    await hotel.remove();
    res.json({ status: true, message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
