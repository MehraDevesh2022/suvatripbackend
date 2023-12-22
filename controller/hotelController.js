// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');
const multerConfigs = require('../middleWare/multerConfig');

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
      if(!hotels){
        return res.status(404).json({ error: 'Hotel not found!' });
      }
      if(req.isHotelAccess){
        return res.json({ status: true, message: 'Hotel data fetched successfully', data: hotels , isHotelAccess: true});
      }else{
        return res.json({ status: true, message: 'Hotel data fetched successfully', data: hotels , isHotelAccess: false });
      }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHotel = async (req, res) => {

  const { uploadPicture } = multerConfigs;

  uploadPicture(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send('Error uploading files.');
    }

    let data = {
      contactNo: JSON.parse(req.body.contactDetails).contactNo,
      country: JSON.parse(req.body.contactDetails).country,
      city: JSON.parse(req.body.contactDetails).city,
      ...JSON.parse(req.body.basicDetails),
      facilities: JSON.parse(req.body.facility),
      hotelRules: JSON.parse(req.body.hotelRules),
      paymentPolicy: JSON.parse(req.body.paymentPolicy),
      parking: JSON.parse(req.body.parking),
      transportation: JSON.parse(req.body.transportation),
    }

    const pictureLinks = req.files['picture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/propertyPicture/${file.filename}` }));
    const roomPictureLinks = req.files['roomPicture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/propertyPicture/${file.filename}` }));
    const areaPictureLinks = req.files['areaPicture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/propertyPicture/${file.filename}` }));
    const documentLinks = req.files['file'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/documents/${file.filename}` }));

    try {
      const hotel = new Hotel({
        ...data,
        roomsNo: JSON.parse(req.body.roomSetup).modalData.length,
        propertyPicture: pictureLinks,
        roomPicture: roomPictureLinks,
        areaPicture: areaPictureLinks,
        document: documentLinks
      });

      const newHotel = await hotel.save();
      res.json({ status: true, message: 'Hotel created successfully', data: newHotel });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
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
