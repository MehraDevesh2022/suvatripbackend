// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');
const Facility = require('../model/hotelFacilities');
const Ammenity = require('../model/roomAmmenities');
const Booking = require("../model/bookingSchema");
const Room = require("../model/roomSchema");
const User = require("../model/userSchema");
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ error: "Users not found!" });
    }

    return res.json({
      status: true,
      message: "User data fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const { status } = req.body;

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

exports.getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();

    if (!facilities) {
      return res.status(404).json({ error: "Facilities not found!" });
    }

    return res.json({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFacilities = async (req, res) => {
  try {   
    let data = {
      name: req.body.name
    }

    const facility = new Facility(data);
    await facility.save();
    const facilities = await Facility.find();
    if(!facilities) {
      res.status(201).send({
        status: true,
        message: [facility],
        data: facilities,
      });
    }
    res.status(201).send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateFacilities = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).send({ error: 'Facility not found' });
    }

    updates.forEach(update => (facility[update] = req.body[update]));
    await facility.save();

    const facilities = await Facility.find();

    res.send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteFacilities = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id)

    if (!facility) {
      return res.status(404).send({ error: 'Facility not found' });
    }

    const facilities = await Facility.find();

    res.send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAllAmmenities = async (req, res) => {
  try {
    const facilities = await Ammenity.find();

    if (!facilities) {
      return res.status(404).json({ error: "Facilities not found!" });
    }

    return res.json({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAmmenities = async (req, res) => {
  try {
    console.log(req.body, 'rrrrrrrrr');
    
    let data = {
      name: req.body.name
    }

    const facility = new Ammenity(data);
    await facility.save();
    const facilities = await Ammenity.find();
    if(!facilities) {
      res.status(201).send({
        status: true,
        message: [facility],
        data: facilities,
      });
    }
    res.status(201).send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateAmmenities = async (req, res) => {
  console.log(req.body, 'aaaaaaa');
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const facility = await Ammenity.findById(req.params.id);

    if (!facility) {
      return res.status(404).send({ error: 'Facility not found' });
    }

    updates.forEach(update => (facility[update] = req.body[update]));
    await facility.save();
    const facilities = await Ammenity.find();
    res.send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteAmmenities = async (req, res) => {
  try {
    const facility = await Ammenity.findByIdAndDelete(req.params.id)

    if (!facility) {
      return res.status(404).send({ error: 'Facility not found' });
    }
    const facilities = await Ammenity.find();
    res.send({
      status: true,
      message: "Facilities data fetched successfully",
      data: facilities,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .select('checkIn checkOut')
      .populate({
        path: 'hotel_id',
        model: Hotel, 
        select: 'propertyPicture propertyName country currency' 
      })
      .populate({
        path: 'room_id',
        model: Room, 
        select: 'weekdayPrice'
      });
      console.log(bookings, 'bookings');

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Bookings not found',
      });
    }

    res.json({
      status: true,
      message: 'All bookings retrieved successfully',
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};