const Invoice = require("../model/invoiceSchema");

exports.createInvoice = async (req, res) => {
  try {
    const allowedFields = ['booking_id', 'invoice_url', 'payment_status', 'created_at'];

    const newInvoiceData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        newInvoiceData[key] = req.body[key];
      }
    });

    const newInvoice = await Invoice.create(newInvoiceData);
    res.status(201).json({
      status: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('booking_id');
    res.json({
      status: true,
      message: 'All invoices retrieved successfully',
      data: invoices
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('booking_id');
    if (!invoice) {
      return res.status(404).json({
        status: false,
        message: 'Invoice not found'
      });
    }
    res.json({
      status: true,
      message: 'Invoice retrieved successfully',
      data: invoice
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        status: false,
        message: 'Invoice not found'
      });
    }

    const allowedFields = ['booking_id', 'invoice_url', 'payment_status'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        invoice[key] = req.body[key];
      }
    });

    const updatedInvoice = await invoice.save();
    res.json({
      status: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({
        status: false,
        message: 'Invoice not found'
      });
    }
    res.json({
      status: true,
      message: 'Invoice deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

