const express = require('express');
const router = express.Router();
const { addContact, getContacts, toggleFavorite, deleteContact } = require('../controllers/contactController'); // استدعاء الدالة
const protect = require('../middleware/authMiddleware');




router.get('/', protect, getContacts);
router.post('/', protect, addContact);
router.delete('/:id', protect, deleteContact);

// المسار الجديد لتحديث المفضلة
router.put('/:id/favorite', protect, toggleFavorite); 

module.exports = router;