const Ticket = require("../model/ticketSchema");
const generateUUID = require("../utils/createUUID");
exports.sendMessage = async (req, res) => {
  const { id } = req.user
  const { reciever, role, message } = req.body;

  try {

    let ticket;
    if(role==='user') {
      ticket = await Ticket.findOne({ user_id: id, vendor_id: reciever });
    } else if(role==='vendor') {
      ticket = await Ticket.findOne({ user_id: reciever, vendor_id: id });
    } else {
      res.status(400).json({ success: false, error: 'Role not found' });
    }

    if (!ticket) {
        ticket = new Ticket({
          user_id: sender,
          vendor_id: vendor,
          messages: [{ sender: id, reciever: reciever, message: message, timestamp: Date.now() }]
        });
    } else {
      ticket.messages.push({ sender: id, reciever: reciever, message: message, timestamp: Date.now() });
    }

    await ticket.save();

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id, role } = req.user;

    let chat;

    if (role === 'vendor') {
      chat = await Ticket.find({ vendor_id: id }).select('user_id').populate({
        path: 'user_id',
        select: 'username'
      });
    } else if (role === 'user') {
      chat = await Ticket.find({ user_id: id }).select('vendor_id').populate({
        path: 'vendor_id',
        select: 'username'
      });
    } else {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ status: true, message: 'Chats fetched successfully', data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getMessagesById = async (req, res) => {
  try {
    const { id, role } = req.user;
    const {chatId} = req.params;

    let chat;

    if (role === 'vendor') {
      chat = await Ticket.find({ vendor_id: id, user_id: chatId }).populate({
        path: 'user_id',
        select: 'username'
      });
    } else if (role === 'user') {
      chat = await Ticket.find({ user_id: id, vendor_id: chatId }).populate({
        path: 'vendor_id',
        select: 'username'
      });
    } else {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ status: true, message: 'Chats fetched successfully', data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

