const Ticket = require("../model/ticketSchema");
const generateUUID = require("../utils/createUUID");
exports.sendMessage = async (req, res) => {
  const { user_id, vendor_id, message } = req.body;

  try {
    // Check if chat already exists
    let ticket = await Ticket.findOne({ user_id: user_id, vendor_id: vendor_id });

    if (!ticket) {
      ticket = new Ticket({
        user_id: sender,
        vendor_id: vendor,
        messages: [{ sender, vendor, message }]
      });
    } else {
      ticket.messages.push({ sender, vendor, message });
    }

    // Save the ticket (either new or updated)
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMessages = async (req, res) => {
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

exports.getMessagesById = async (req, res) => {
  try {
    const {id} = req.params;
    const rooms = await Room.find({hotel_id: id});
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

