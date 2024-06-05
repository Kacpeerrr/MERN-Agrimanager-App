const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware')
const {
	addMachine,
	getMachines,
	getMachine,
	deleteMachine,
	updateMachine,
} = require('../controllers/machineController')
const { upload } = require('../utils/fileUpload')

router.post('/', protect, upload.single('image'), addMachine)
router.patch('/:id', protect, upload.single('image'), updateMachine)
router.get('/', protect, getMachines)
router.get('/:id', protect, getMachine)
router.delete('/:id', protect, deleteMachine)

module.exports = router
