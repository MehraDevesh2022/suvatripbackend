const Room = require("../model/roomSchema");
const generateUUID = require("../utils/createUUID");
exports.createRoom = async (req, res) => {
  try {
    const { hotelId, roomType, guests, beds, bathrooms, price } = req.body;

    const newRoom = new Room({
      hotel_id: hotelId,
      roomType,
      guests,
      beds,
      bathrooms,
      price
    });

    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const {hotelId} = req.body;
    const rooms = await Room.find({hotel_id: hotelId});
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndRemove({ UUID: req.params.id });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ status: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

