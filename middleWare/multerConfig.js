const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destination;
    if (file.fieldname === 'picture') {
      destination = 'public/uploads/propertyPicture/';
    } else if (file.fieldname === 'roomPicture') {
      destination = 'public/uploads/roomPicture/';
    } else if (file.fieldname === 'areaPicture') {
      destination = 'public/uploads/areaPicture/';
    } else if (file.fieldname === 'file') {
      destination = 'public/uploads/documents/';
    }
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadPicture = multer({ storage }).fields([
  { name: 'picture', maxCount: 5 },
  { name: 'roomPicture', maxCount: 5 },
  { name: 'areaPicture', maxCount: 5 },
  { name: 'file', maxCount: 1 },
]);

  module.exports = {
    uploadPicture
  };