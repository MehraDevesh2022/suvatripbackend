// controllers/hotelController.js
const Hotel = require('../model/hotelSchema');
const multerConfigs = require('../middleWare/multerConfig');

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json({ status: true, message: 'Hotel data fetched successfully', data: hotels });
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

    let facilities = {
      accommodation: JSON.parse(req.body.facility).accommodation ? JSON.parse(req.body.facility).accommodation : [],
      recreation: JSON.parse(req.body.facility).recreation ? JSON.parse(req.body.facility).recreation : [],
      connectivity: JSON.parse(req.body.facility).connectivity ? JSON.parse(req.body.facility).connectivity : []
    }

    let ammenities = {}

    if(req.body.ammenities) {
      ammenities = {
        bathroom: JSON.parse(req.body.ammenities).bathroom ? JSON.parse(req.body.ammenities).bathroom : [],
        inRoom: JSON.parse(req.body.ammenities).inRoom ? JSON.parse(req.body.ammenities).inRoom : [],
      }
    }  else {
      ammenities = {
        bathroom: [],
        inRoom: [],
      }
    }

    console.log(req.files);

    let data = {
      contactNo: JSON.parse(req.body.contactDetails).contactNo,
      country: JSON.parse(req.body.contactDetails).country,
      city: JSON.parse(req.body.contactDetails).city,
      ...JSON.parse(req.body.basicDetails),
      facilities: facilities,
      ammenities: ammenities,
      hotelRules: JSON.parse(req.body.hotelRules),
      paymentPolicy: JSON.parse(req.body.paymentPolicy),
      parking: JSON.parse(req.body.parking),
      transportation: JSON.parse(req.body.transportation),
      description: JSON.parse(req.body.description),
    }

    const pictureLinks = req.files['picture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/propertyPicture/${file.filename}` }));
    const roomPictureLinks = req.files['roomPicture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/roomPicture/${file.filename}` }));
    const areaPictureLinks = req.files['areaPicture'].map(file => ({ link: `${process.env.HOST}${":" + process.env.PORT}/uploads/areaPicture/${file.filename}` }));
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
    const { fields } = req.query;

    let query = Hotel.findOne({ vendor_id: id });

    if (fields) {
      const fieldsArray = fields.split(',');
      query = query.select(fieldsArray.join(' '));
    }

    const hotels = await query.exec();
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
    'promoted',
    'ammenities',
    'description'
  ];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every(field => allowedFields.includes(field));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid fields in request!' });
  }

  try {
    const hotel = await Hotel.findOneAndUpdate(
      { vendor_id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    console.log(hotel);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found!' });
    }

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
