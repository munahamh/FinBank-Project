const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  // ربط الرصيد بالمستخدم الذي يملكه
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  currency: { 
    type: String, 
    required: true,
    enum: ['USD', 'TRY', 'ETH'] 
  },
  amount: { 
    type: Number, 
    default: 0 
  },
  // الرصيد المدور أو المنقول
  devir: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Balance', balanceSchema);