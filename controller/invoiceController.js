const Invoice = require("../model/invoiceSchema");
const generateUUID = require("../utils/createUUID");
exports.createInvoice = async (req, res) => {
  try {
    const { booking_id, invoice_url } = req.body;

    const newInvoice = new Invoice({
      UUID: generateUUID(), // You can use a function to generate a UUID
      booking_id,
      invoice_url,
      payment_status: "Pending",
    });

    const savedInvoice = await newInvoice.save();

    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ UUID: req.params.id });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { payment_status } = req.body;

    const invoice = await Invoice.findOne({ UUID: req.params.id });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    invoice.payment_status = payment_status || invoice.payment_status;

    await invoice.save();

    res.json({
      status: true,
      message: "Invoice data updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndRemove({ UUID: req.params.id });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ status: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

