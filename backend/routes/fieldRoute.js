const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware')
const { addField, updateField, getFields, getField, deleteField } = require('../controllers/fieldController')
const { upload } = require('../utils/fileUpload')

router.post('/', protect, upload.single('image'), addField)
router.patch('/:id', protect, upload.single('image'), updateField)
router.get('/', protect, getFields)
router.get('/:id', protect, getField)
router.delete('/:id', protect, deleteField)

module.exports = router
