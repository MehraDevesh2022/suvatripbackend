const Ticket = require("../model/ticketSchema")

exports.createTicket = async (req, res) => {
    try {
      const { user_id, vendor_id, messages } = req.body;
  
      // Check if there is an existing ticket for the user
      let existingTicket = await Ticket.findOne({ user_id });
  
      if (existingTicket) {
        // Update the existing ticket by adding a new message
        existingTicket.messages.push(...messages);
        await existingTicket.save();
  
        res.status(200).json({
          status: true,
          message: 'Ticket updated successfully',
          data: existingTicket,
        });
      } else {
        // Create a new ticket
        const newTicket = await Ticket.create({ user_id, vendor_id, messages });
  
        res.status(201).json({
          status: true,
          message: 'Ticket created successfully',
          data: newTicket,
        });
      }
    } catch (error) {
      console.error('Error creating/updating ticket:', error.message);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  };
  