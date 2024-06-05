const asyncHandler = require('express-async-handler')
const Document = require('../models/documentModel')
const { fileSizeFormatter } = require('../utils/fileUpload')
const cloudinary = require('cloudinary').v2

const addDocument = asyncHandler(async (req, res) => {
	const { name, documentNumber, paymentDate } = req.body

	//Validation
	if (!name || !documentNumber || !paymentDate) {
		res.status(400)
		throw new Error('Uzupełnij wszystkie pola')
	}

	//Handle image upload
	let fileData = {}
	if (req.file) {
		//Save imat to cloudinary
		let uploadedFile
		try {
			uploadedFile = await cloudinary.uploader.upload(req.file.path, {
				folder: 'agrimanager.pl',
				resource_type: 'image',
			})
		} catch (error) {
			res.status(500)
			throw new Error('Zdjęcie nie może być wysłane')
		}

		fileData = {
			filename: req.file.originalname,
			filePath: uploadedFile.secure_url,
			fileType: req.file.mimetype,
			fileSize: fileSizeFormatter(req.file.size, 2),
		}
	}

	//Add Document
	const document = await Document.create({
		user: req.user.id,
		name,
		documentNumber,
		paymentDate,
		image: fileData,
	})
	res.status(201).json(document)
})

// Get all documents
const getDocuments = asyncHandler(async (req, res) => {
	const documents = await Document.find({ user: req.user.id }).sort('-createdAt')
	res.status(200).json(documents)
})

// Get single document
const getDocument = asyncHandler(async (req, res) => {
	const document = await Document.findById(req.params.id)
	// If document doesn't exist
	if (!document) {
		res.status(404)
		throw new Error('Dokument nie istnieje')
	}
	// Match document to user
	if (document.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do dokuumentu')
	}
	res.status(200).json(document)
})

// Delete document
const deleteDocument = asyncHandler(async (req, res) => {
	const document = await Document.findById(req.params.id)
	// If document doesn't exist
	if (!document) {
		res.status(404)
		throw new Error('Dokument nie istnieje')
	}
	// Match document to user
	if (document.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do dokumentu')
	}
	await document.deleteOne()
	res.status(200).json({ message: 'Dokument usunięty' })
})

// Update document
const updateDocument = asyncHandler(async (req, res) => {
	const { name, documentNumber, paymentDate } = req.body
	const { id } = req.params

	const document = await Document.findById(id)

	// If document doesn't exist
	if (!document) {
		res.status(404)
		throw new Error('Dokument nie istnieje')
	}

	// Match document to user
	if (document.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do dokumentu')
	}

	// Handle image upload
	let fileData = {}
	if (req.file) {
		// Save image to cloudinary
		let uploadedFile
		try {
			uploadedFile = await cloudinary.uploader.upload(req.file.path, {
				folder: 'agrimanager.pl',
				resource_type: 'image',
			})
		} catch (error) {
			res.status(500)
			throw new Error('Zdjęcie nie może być wysłane')
		}

		fileData = {
			fileName: req.file.originalname,
			filePath: uploadedFile.secure_url,
			fileType: req.file.mimetype,
			fileSize: fileSizeFormatter(req.file.size, 2),
		}
	}

	// Update document
	const updatedDocument = await Document.findByIdAndUpdate(
		{ _id: id },
		{
			name,
            documentNumber,
            paymentDate,
			image: Object.keys(fileData).length === 0 ? document?.image : fileData,
		},
		{
			new: true,
			runValidators: true,
		}
	)
	res.status(200).json(updatedDocument)
})

module.exports = {
    addDocument,
	getDocuments,
	getDocument,
	deleteDocument,
    updateDocument
}