// controllers/hotelController.js
const Hotel = require("../model/hotelSchema");
const multerConfigs = require("../middleWare/multerConfig");

const nodemailer = require("nodemailer");
const Room = require("../model/roomSchema");
const moment = require("moment");

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
    const hotels = await Hotel.find().populate("rooms");

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

const Booking = require("../model/bookingSchema");

exports.filterHotels = async (req, res) => {
  const { checkIn, checkOut, location } = req.body;
console.log(req.body , "req.body")

  const sanitizedLocation = location.trim();

  console.log(checkIn, checkOut, 'ffffff');

  try {
    let hotels;

    console.log(sanitizedLocation.toLowerCase());
    if (sanitizedLocation.toLowerCase() === "all") {
      hotels = await Hotel.find();
    } else {
      hotels = await Hotel.find({
        city: { $regex: new RegExp(`^${sanitizedLocation}$`, "i") },
      });
    }

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: "Hotels not found!" });
    }

    const bookingsWithinRange = await Booking.find({
      $and: [
        {
          $or: [
            {
              $and: [
                { checkIn: { $gte: new Date(checkIn) } },
                { checkIn: { $lte: new Date(checkOut) } },
              ],
            },
            {
              $and: [
                { checkOut: { $gte: new Date(checkIn) } },
                { checkOut: { $lte: new Date(checkOut) } },
              ],
            },
            {
              $and: [
                { checkIn: { $lte: new Date(checkIn) } },
                { checkOut: { $gte: new Date(checkOut) } },
              ],
            },
            {
              $or: [
                { checkIn: { $eq: new Date(checkIn) } },
                { checkOut: { $eq: new Date(checkOut) } },
              ],
            },
          ],
        },
        { hotel_id: { $in: hotels.map((hotel) => hotel._id) } },
      ],
    }).populate("room_id");

    const sumOfBooking = bookingsWithinRange.reduce(
      (total, room) => total + room.noOfRooms,
      0
    );

    const roomIds = bookingsWithinRange.map((booking) => booking.room_id);

    const rooms = await Room.find({ _id: { $in: roomIds } });

    const sumOfRooms = rooms.reduce((total, room) => total + room.noOfRooms, 0);

    let filteredHotels;

    if (parseInt(sumOfBooking) >= parseInt(sumOfRooms)) {
      const hotelIdsWithBookings = bookingsWithinRange.map((booking) =>
        booking.hotel_id.toString()
      );

      filteredHotels = hotels.filter(
        (hotel) => !hotelIdsWithBookings.includes(hotel._id.toString())
      );
    } else {
      filteredHotels = hotels;
    }

    if (req.isHotelAccess) {
      return res.json({
        status: true,
        message: "Hotels available within the date range",
        data: filteredHotels,
        isHotelAccess: true,
      });
    } else {
      return res.json({
        status: true,
        message: "Hotels available within the date range",
        data: filteredHotels,
        isHotelAccess: false,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHotel = async (req, res) => {
  const { uploadPicture } = multerConfigs;
  console.log(req.body, "req.body");

  uploadPicture(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send("Error uploading files.");
    }

    console.log(req.body);

    let facilities = req.body.facility ? JSON.parse(req.body.facility) : [];

    let ammenities = req.body.ammenities ? JSON.parse(req.body.ammenities) : [];

    console.log('step1');

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
      rating: JSON.parse(req.body.basicDetails).starRating,
      zipCode: req.body.zipCode,
      rooms: JSON.parse(req.body.rooms)
    };

    console.log('step2');

    const pictureLinks = req.files["picture"]?.map((file, index) => ({
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

    console.log('step3');

    try {
      const hotel = new Hotel({
        ...data,
        roomsNo: JSON.parse(req.body.rooms).length,
        propertyPicture: pictureLinks,
        roomPicture: roomPictureLinks,
        areaPicture: areaPictureLinks,
        taxFile: taxDocumentLinks,
        propertyFile: propertyDocumentLinks,
        vendor_id: req.user.id,
      });

      const newHotel = await hotel.save();

      const mailOptions = {
        from: "suvatrip1@gmail.com",
        to: req.user.email,
        subject: "Approval Pending",
        text: "Hello,\n\nYour registration is under approval. We will let you know once approved.",
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

// exports.filterHotels = async (req, res) => {
//   try {
//     const { location, startDate, endDate, children, room, adult } = req.query;

//     console.log(req.query, "req.query");

//     if (!location || typeof location !== "string") {
//       return res.status(400).json({ error: "Invalid location parameter" });
//     }

//     const sanitizedLocation = location.trim();

//     if (!sanitizedLocation) {
//       return res
//         .status(400)
//         .json({ error: "Location parameter cannot be empty" });
//     }

//     const decodedStartDate = new Date(decodeURIComponent(startDate));
//     const decodedEndDate = new Date(decodeURIComponent(endDate));

//     const formatTime = (date) => {
//       const hours = String(date.getUTCHours()).padStart(2, '0');
//       const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//       return `${hours}:${minutes}`;
//     };

//     const checkInTime = formatTime(decodedStartDate);
//     const checkOutTime = formatTime(decodedEndDate);

//     const filteredHotels = await Hotel.find({
//       country: { $regex: new RegExp(`^${sanitizedLocation}$`, "i") },
//       // roomsNo: { $gte: room },
//       // 'hotelRules.allowChildren': children === 'yes',
//       // 'hotelRules.checkInData.from': { $lte: checkInTime },
//       // 'hotelRules.checkInData.until': { $gte: checkInTime },
//       // 'hotelRules.checkOutData.from': { $lte: checkOutTime },
//       // 'hotelRules.checkOutData.until': { $gte: checkOutTime },
//     })// .populate({
//     //   path: 'rooms',
//     //   match: { noOfRooms: { $gte: room } },
//     // });

//     console.log(filteredHotels, "filteredHotels");

//     res.status(200).json({
//       status: true,
//       message: "Hotel data fetched successfully",
//       data: filteredHotels,
//     });
//   } catch (error) {
//     console.error("Error filtering hotels:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

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

// get hotel by based on filter query

exports.getHotelFilterd = async (req, res) => {
  try {
    // Construct the MongoDB query based on the request query parameters
    console.log(req.query , "req.query") 
    const queryObj = buildQuery(req.query);
    // console.log(queryObj.hotelQuery , "queryObj");   
    // console.log(queryObj , "queryObj");

   
    const filteredHotels = await Hotel.find(queryObj.hotelQuery);      
    console.log(filteredHotels , "filteredHotels")        
     
    // if(queryObj.roomQuery) {
    //   const roomFilteredHotels = await Room.find(queryObj.roomQuery);
    //   console.log(roomFilteredHotels , "roomFilteredHotels") 
    // }
 
 if(!filteredHotels) {
      return res.status(404).json({ error: 'Hotels not found' });
    }

    res.status(200).json({ success: true, message: 'Hotels fetched successfully', data: filteredHotels });  

  } catch (error) {
    console.error("Error fetching filtered hotels:", error); 
    res.status(500).json({ error: "Internal Server Error" });
  }
}; 
 
const buildQuery = (queryParams) => {
  const query = {};
  const roomQuery = {}; // Separate query for room schema

  if (queryParams.starRating) {
    const starRatingArray = queryParams.starRating.split(',').map(Number);
    query.rating = { $in: starRatingArray };
  }

  if (queryParams.propertyType) {
    const propertyTypeArray = queryParams.propertyType.split(',');
    query.propertyType = { $in: propertyTypeArray };
  }

  if (queryParams.facilities) {
    const facilitiesArray = queryParams.facilities.split(',');
    query['facilities.accommodation'] = { $in: facilitiesArray };
  } 

  if (queryParams.minBudget && queryParams.maxBudget) {
    roomQuery.weekdayPrice = {
      $gte: Number(queryParams.minBudget),
      $lte: Number(queryParams.maxBudget),
    };  
  }

  if (queryParams.priceRange) {
    console.log(queryParams.priceRange, 'priceRange');
    switch (queryParams.priceRange) {
      case 'NPR 0 - 1500':
        roomQuery.weekdayPrice = { $lte: 1500 };
        break;
      case 'NPR 1500 - 2500':
        roomQuery.weekdayPrice = { $gte: 1500, $lte: 2500 };
        break; 
      case 'NPR 2500 - 3500':
        roomQuery.weekdayPrice = { $gte: 2500, $lte: 3500 };
        break;
      case 'NPR 3500 - 4500':
        roomQuery.weekdayPrice = { $gte: 3500, $lte: 4500 };
        break;
      case 'NPR 4500+':
        roomQuery.weekdayPrice = { $gte: 4500 };
        break;
      default:
        break;
    }
  }
  console.log(roomQuery, 'roomQuery');
  console.log(query, 'query');
  return { hotelQuery: query, roomQuery };
};


  
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;

    let query = Hotel.findOne({ _id: id }).populate("rooms");
    //  console.log(query , "query"); 
    if (fields) {
      const fieldsArray = fields.split(",");
      query = query.select(fieldsArray.join(" "));
    }
 
    const hotels = await query.exec(); 

    // console.log(hotels, "hotels");

    if (!hotels) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    // console.log("hello")
    console.log(hotels, "hotelData");

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
      { _id: req.params.id },
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
