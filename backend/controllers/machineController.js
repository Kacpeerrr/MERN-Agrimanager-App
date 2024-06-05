const asyncHandler = require('express-async-handler')
const Machine = require('../models/machineModel')
const { fileSizeFormatter } = require('../utils/fileUpload')
const cloudinary = require('cloudinary').v2

const addMachine = asyncHandler(async (req, res) => {
	const { brand, model, productionYear, category } = req.body

	//Validation
	if (!brand || !model || !productionYear || !category) {
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

	//Add Machine
	const machine = await Machine.create({
		user: req.user.id,
		brand,
		model,
		productionYear,
		category,
		image: fileData,
	})
	res.status(201).json(machine)
})

// Get all machines
const getMachines = asyncHandler(async (req, res) => {
	const machines = await Machine.find({ user: req.user.id }).sort('-createdAt')
	res.status(200).json(machines)
})

// Get single machine
const getMachine = asyncHandler(async (req, res) => {
	const machine = await Machine.findById(req.params.id)
	// If machine doesn't exist
	if (!machine) {
		res.status(404)
		throw new Error('Maszyna nie istnieje')
	}
	// Match machine to user
	if (machine.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do maszyn')
	}
	res.status(200).json(machine)
})

// Delete machine
const deleteMachine = asyncHandler(async (req, res) => {
	const machine = await Machine.findById(req.params.id)
	// If machine doesn't exist
	if (!machine) {
		res.status(404)
		throw new Error('Maszyna nie istnieje')
	}
	// Match machine to user
	if (machine.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do maszyny')
	}
	await machine.deleteOne()
	res.status(200).json({ message: 'Maszyna usunięta' })
})

// Update machine
const updateMachine = asyncHandler(async (req, res) => {
	const { brand, model, productionYear, category } = req.body
	const { id } = req.params

	const machine = await Machine.findById(id)

	// If machine doesn't exist
	if (!machine) {
		res.status(404)
		throw new Error('Maszyna nie istnieje')
	}

	//match machine to user
	if (machine.user.toString() !== req.user.id) {
		res.status(401)
		throw new Error('Użytkownik bez autoryzacji do maszyny')
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

	// Update machine
	const updatedMachine = await Machine.findByIdAndUpdate(
		{ _id: id },
		{
			brand,
            model,
            productionYear,
			category,
			image: Object.keys(fileData).length === 0 ? machine?.image : fileData,
		},
		{
			new: true,
			runValidators: true,
		}
	)
	res.status(200).json(updatedMachine)
})

module.exports = {
	addMachine,
	getMachines,
	getMachine,
	deleteMachine,
    updateMachine
}
