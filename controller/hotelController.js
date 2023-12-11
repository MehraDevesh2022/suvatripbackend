// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json({ status: true, message: 'Hotel data fetched successfully', data: hotels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHotel = async (req, res) => {
  const allowedFields = [
    'UUID',
    'vendor_id',
    'propertyName',
    'contactNo',
    'country',
    'city',
    'address',
    'propertyType',
    'roomsNo',
    'currency',
    'photos',
    'facilities',
    'hotelRules',
    'paymentPolicy',
    'parking',
    'latitude',
    'longitude',
    'promoted'
  ];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every(field => allowedFields.includes(field));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid fields in request!' });
  }

  try {
    const hotel = new Hotel(req.body);
    const newHotel = await hotel.save();
    res.json({ status: true, message: 'Hotel created successfully', data: newHotel });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotels = await Hotel.findById(id);
    res.json({ status: true, message: 'Hotel data fetched successfully', data: hotels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  const allowedFields = [
      'UUID',
      'vendor_id',
      'propertyName',
      'contactNo',
      'country',
      'city',
      'address',
      'propertyType',
      'roomsNo',
      'currency',
      'photos',
      'facilities',
      'hotelRules',
      'paymentPolicy',
      'parking',
      'latitude',
      'longitude',
      'promoted'
  ];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every(field => allowedFields.includes(field));

  if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid fields in request!' });
  }

  try {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) {
          return res.status(404).json({ error: 'Hotel not found!' });
      }

      allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
              hotel[field] = req.body[field];
          }
      });

      await hotel.save();
      res.json({ status: true, message: 'Hotel data updated successfully', data: hotel });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) {
          return res.status(404).json({ error: 'Hotel not found!' });
      }

      await hotel.remove();
      res.json({ status: true, message: 'Hotel deleted successfully' });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};
