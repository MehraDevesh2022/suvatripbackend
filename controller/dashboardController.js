// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');
const multerConfigs = require('../middleWare/multerConfig');
const nodemailer = require('nodemailer');

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