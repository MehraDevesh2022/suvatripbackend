
const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoiceController');
const authenticateToken = require('../middleWare/auth'); 

// Create a new invoice
router.post('/invoices', authenticateToken, invoiceController.createInvoice);

// Get all invoices 
router.get('/invoices', authenticateToken, invoiceController.getAllInvoices);

// Get a specific invoice by UUID
router.get('/invoices/:id', authenticateToken, invoiceController.getInvoiceById);

// Update an invoice by UUID
router.patch('/invoices/:id', authenticateToken, invoiceController.updateInvoice);

// Delete an invoice by UUID
router.delete('/invoices/:id', authenticateToken, invoiceController.deleteInvoice);

module.exports = router;
