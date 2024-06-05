const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware')
const {
	addDocument,
	updateDocument,
	getDocuments,
	getDocument,
	deleteDocument,
} = require('../controllers/documentController')
const { upload } = require('../utils/fileUpload')

router.post('/', protect, upload.single('image'), addDocument)
router.patch('/:id', protect, upload.single('image'), updateDocument)
router.get('/', protect, getDocuments)
router.get('/:id', protect, getDocument)
router.delete('/:id', protect, deleteDocument)

module.exports = router
