const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // سنقوم بتشفيرها لاحقاً
  phone: { type: String },
  
  profilePic: {
    type: String,
    default: ""
  },

  twoFactorAuth: { 
    type: Boolean, 
    default: false 
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: true }
  },
  
  // إعدادات المستخدم (تتطابق مع صفحة Settings)
  settings: {
    twoFactorAuth: { type: Boolean, default: false },
    language: { type: String, default: 'English (US)' },
    defaultCurrency: { type: String, default: 'USD' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: true }
    }
  }
}, { timestamps: true }); // timestamps تقوم بإضافة تاريخ الإنشاء والتحديث تلقائياً

module.exports = mongoose.model('User', userSchema);