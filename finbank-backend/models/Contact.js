const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // لربط جهة الاتصال بحسابك أنتِ فقط
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  isFavorite: { 
    type: Boolean, 
    default: false // إذا كان true سيظهر في الدوائر العلوية للتحويل السريع
  },
  avatarColor: { 
    type: String, 
    default: '#6366f1' // لون افتراضي للدائرة التي ستحمل أول حرف من اسمه
  },
  hasFinbankAccount: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);