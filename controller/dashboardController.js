// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');
const nodemailer = require('nodemailer');

// Create a SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: '587',
  auth: {
    user: 'suvatrip1@gmail.com',
    pass: 'aHSmbLgWfVqr54Uy'
  }
});

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.user;

    const { fields } = req.query;

    let query = Hotel.findOne({ vendor_id: id });

    if (fields) {
      const fieldsArray = fields.split(",");
      query = query.select(fieldsArray.join(" "));
    }

    const hotels = await query.exec();


    if (!hotels) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    console.log("hello")
    console.log(hotels, "hotelData")

    res.json({

      message: "Hotel data fetched successfully",
      data: hotels,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHotelByVendorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { fields } = req.query;

    let query = Hotel.findOne({ vendor_id: id });

    if (fields) {
      const fieldsArray = fields.split(",");
      query = query.select(fieldsArray.join(" "));
    }

    const hotels = await query.exec();


    if (!hotels) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    console.log("hello")
    console.log(hotels, "hotelData")

    res.json({

      message: "Hotel data fetched successfully",
      data: hotels,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();

    if (!hotels) {
      return res.status(404).json({ error: "Hotels not found!" });
    }

    return res.json({
      status: true,
      message: "Hotel data fetched successfully",
      data: hotels,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveHotel = async (req, res) => {
  try {
    const {status} = req.body;

    console.log(status);

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isVerified: status } },
      { new: true, runValidators: true }
    ).populate('vendor_id');

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found!" });
    }

    const hotels = await Hotel.find();

    const mailOptions = {
      from: 'suvatrip1@gmail.com',
      to: hotel.vendor_id.email,
      subject: 'Registration Successful',
      text: 'Hello,\n\nYour property is not approved and you can login from the dashboard. Welcome aboard!.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.json({
      status: true,
      message: "Hotel verified successfully",
      data: hotels,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};