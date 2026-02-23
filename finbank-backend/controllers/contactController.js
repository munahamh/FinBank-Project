const Contact = require('../models/Contact');
const User = require('../models/User');

// 1. دالة إضافة جهة اتصال جديدة (مع التحقق الذكي)
const addContact = async (req, res) => {
  try {
    const { name, email, phone, isFavorite, avatarColor } = req.body;

    // 👈 السحر هنا: نبحث هل هذا الإيميل مسجل لدينا في بنك FinBank؟
    const existingUser = await User.findOne({ email: email });
    
    // إذا وجدناه، ستكون القيمة true، وإذا لم نجده ستكون false
    const hasAccount = existingUser ? true : false;

    const newContact = new Contact({
      userId: req.user.id,
      name,
      email,
      phone,
      isFavorite,
      avatarColor,
      hasFinbankAccount: hasAccount // 👈 حفظ النتيجة في قاعدة البيانات
    });

    await newContact.save();

    // رسالة ديناميكية تخبر الواجهات بما حدث
    const responseMessage = hasAccount 
      ? "تم إضافة جهة الاتصال. (هذا الشخص يمتلك حساباً في FinBank! ✅)"
      : "تم إضافة جهة الاتصال كجهة خارجية. (لا يمكن التحويل له ❌)";

    res.status(201).json({ 
      message: responseMessage, 
      contact: newContact 
    });

  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إضافة جهة الاتصال", error: error.message });
  }
};

// 2. دالة جلب جميع جهات الاتصال الخاصة بالمستخدم
const getContacts = async (req, res) => {
  try {
    // نجلب فقط جهات الاتصال المرتبطة بحسابك
    const contacts = await Contact.find({ userId: req.user.id });
    
    res.status(200).json({
      message: "تم جلب جهات الاتصال بنجاح!",
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب جهات الاتصال", error: error.message });
  }
};

// 3. دالة لتعديل حالة المفضلة (إضافة/إزالة)
const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "جهة الاتصال غير موجودة!" });

    // عكس الحالة الحالية (إذا كانت true تصبح false والعكس)
    contact.isFavorite = !contact.isFavorite; 
    await contact.save();

    res.status(200).json({ message: "تم التحديث بنجاح", contact });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث", error: error.message });
  }
};

// 4. دالة حذف جهة اتصال
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "جهة الاتصال غير موجودة!" });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "تم حذف جهة الاتصال بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف", error: error.message });
  }
};

// تحديث سطر التصدير ليشمل الدالة الجديدة
module.exports = { addContact, getContacts, toggleFavorite, deleteContact };