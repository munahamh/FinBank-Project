const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // إيقاف السيرفر في حال فشل الاتصال
  }
};

module.exports = connectDB;


// {
//   "email": "hamsomuna@gmail.com",
//   "password": "MySuperSecretPassword123"
// }