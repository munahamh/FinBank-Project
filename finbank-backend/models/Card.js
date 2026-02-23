const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cardHolder: { 
    type: String, 
    required: true 
  },
  cardNumber: { 
    type: String, 
    required: true,
    unique: true 
  },
  expiryDate: { 
    type: String, 
    required: true 
  },
  cvv: { 
    type: String, 
    required: true 
  },
  cardType: { 
    type: String, 
    enum: ['Premium', 'Virtual', 'Physical', 'Standard'], 
    default: 'Virtual' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Frozen'], 
    default: 'Active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);