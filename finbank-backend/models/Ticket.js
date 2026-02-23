const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Open' } // Open, In Progress, Closed
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);