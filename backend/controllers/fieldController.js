const asyncHandler = require('express-async-handler')
const Field = require('../models/fieldModel')
const { fileSizeFormatter } = require('../utils/fileUpload')
const cloudinary = require('cloudinary').v2

const addField = asyncHandler(async (req, res) => {
	const { name, location, fieldNumber, surface, currentPlant, sowingDate } = req.body

	//Validation
	if (!name || !location || !fieldNumber || !surface || !currentPlant || !sowingDate) {
		res.status(400)
		throw new Error('Uzupełnij wszystkie pola')
	}

	//Handle image upload
	let fileData = {}
	if (req.file) {
		//Save image to cloudinary
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

	//Add Field
	const field = await Field.create({
		user: req.user.id,
		name,
		location,
		fieldNumber,
		surface,
		currentPlant,
		sowingDate,
		image: fileData,
	})
	res.status(201).json(field)
})

// Get all fields
const getFields = asyncHandler(async (req, res) => {
	const fields = await Field.find({ user: req.user.id }).sort('-createdAt')
	res.status(200).json(fields)
})

// Get single field
const getField = asyncHandler(async (req, res) => {
	const field = await Field.findById(req.params.id)
	// If field doesn't exist
	if (!field) {
		res.status(404)
		throw new Error('Pole nie istnieje')
	}
	// Match field to user
	if (field.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do pola')
	}
	res.status(200).json(field)
})

// Delete field
const deleteField = asyncHandler(async (req, res) => {
	const field = await Field.findById(req.params.id)
	// If field doesn't exist
	if (!field) {
		res.status(404)
		throw new Error('Pole nie istnieje')
	}
	// Match field to user
	if (field.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do pola')
	}
	await field.deleteOne()
	res.status(200).json({ message: 'Pole usunięte' })
})

// Update field
const updateField = asyncHandler(async (req, res) => {
	const { name, location, fieldNumber, surface, currentPlant, sowingDate } = req.body
	const { id } = req.params

	const field = await Field.findById(id)

	// If field doesn't exist
	if (!field) {
		res.status(404)
		throw new Error('Pole nie istnieje')
	}

	// Match field to user
	if (field.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do pola')
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

	// Update field
	const updatedField = await Field.findByIdAndUpdate(
		{ _id: id },
		{
			name,
			location,
			fieldNumber,
			surface,
			currentPlant,
			sowingDate,
			image: Object.keys(fileData).length === 0 ? field?.image : fileData,
		},
		{
			new: true,
			runValidators: true,
		}
	)
	res.status(200).json(updatedField)
})

module.exports = {
	addField,
	getFields,
	getField,
	deleteField,
    updateField
}
