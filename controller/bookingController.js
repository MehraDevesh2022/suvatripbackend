const Booking = require("../model/bookingSchema");
 
exports.createBooking = async (req, res) => {
  try {
    const allowedFields = ['hotel_id', 'room_id', 'user_id', 'invoice_id', 'promotion_id', 'checkIn', 'checkOut', 'estimatedArrival', 'specialRequest', 'phoneNumber', 'noOfRooms'];

    let bookingData = [];

    for (const room of req.body.rooms) {
      const restData = { ...req.body };
      delete restData.rooms;

      const data = {
        room_id: room.roomId,
        noOfRooms: room.count,
        checkIn: restData.checkInDate,
        checkOut: restData.checkOutDate,
        ...restData
      };

      const newBookingData = {};
      Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
          newBookingData[key] = data[key];
        }
      });

      console.log(newBookingData, 'nnnnnnn');

      const createdBooking = await Booking.create(newBookingData);
      bookingData.push(createdBooking);
    }

    res.status(201).json({
      status: true,
      message: 'Booking created successfully',
      data: bookingData
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({hotel_id: req.params.id}).populate('hotel_id room_id user_id invoice_id promotion_id');
    res.json({
      status: true,
      message: 'All bookings retrieved successfully',
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: false,
        message: 'Booking not found'
      });
    }

    const allowedFields = ['UUID', 'hotel_id', 'room_id', 'user_id', 'invoice_id', 'promotion_id', 'checkIn', 'checkOut', 'estimatedArival', 'specialRequest', 'roomNumber', 'status'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        booking[key] = req.body[key];
      }
    });

    const updatedBooking = await booking.save();
    res.json({
      status: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({
        status: false,
        message: 'Booking not found'
      });
    }
    res.json({
      status: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};
