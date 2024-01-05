const Room = require("../model/roomSchema");
const generateUUID = require("../utils/createUUID");
exports.createRoom = async (req, res) => {
  try {
    const { hotelId, roomType, guNumber, bdNumber, bathNum, weekdayPrice, weekendPrice, nonRefundPrice, singleBedValue, kingSizeBedValue, largeBedValue, doubleBedValue, noOfRooms } = req.body;

    const newRoom = new Room({
      hotel_id: hotelId,
      roomType: roomType,
      guests: parseInt(guNumber),
      singleBed: parseInt(singleBedValue),
      doubleBed: parseInt(doubleBedValue),
      kingBed: parseInt(kingSizeBedValue),
      superKingBed: parseInt(largeBedValue),
      totalBeds: bdNumber,
      bathroom: parseInt(bathNum),
      weekdayPrice: parseInt(weekdayPrice),
      weekendPrice: parseInt(weekendPrice),
      nonRefundPrice: parseInt(nonRefundPrice),
      noOfRooms: parseInt(noOfRooms)
    });

    console.log(newRoom);

    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { hotelId, roomType, guests, beds, bathroom, price, noOfRooms } = req.body;

    console.log(roomId);

    const updatedRoom = {
      hotel_id: hotelId,
      roomType: roomType,
      guests: guests,
      beds: beds,
      bathroom: bathroom,
      price: price,
      noOfRooms: noOfRooms
    };

    const room = await Room.findByIdAndUpdate(roomId, updatedRoom, { new: true });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ status: true, message: 'Room updated successfully', data: room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getAllRooms = async (req, res) => {

  try {

    const rooms = await Room.find();
    console.log(rooms ,"rooms");
          
    if(!rooms) {
      return res.status(404).json({ error: 'Rooms not found' });
    }

   res.status(200).json({ success: true, message: 'Rooms fetched successfully', data: rooms });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}



exports.getRoomDetails = async (req, res) => {
  try {
    const {id} = req.params;

    const rooms = await Room.find({ hotel_id: id});
  console.log(id ,rooms?.length ,"rooms");  

    if(!rooms) {
      return res.status(404).json({ error: 'Rooms not found' });
    }

    res.status(200).json({ success: true, message: 'Rooms fetched successfully', data: rooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ status: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

