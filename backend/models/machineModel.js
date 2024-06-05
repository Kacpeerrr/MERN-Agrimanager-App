const mongoose = require('mongoose')

const machineSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		brand: {
			type: String,
			required: [true, 'Podaj markę maszyny'],
			trim: true,
		},
		model: {
			type: String,
			required: [true, 'Podaj model maszyny'],
			trim: true,
		},
		productionYear: {
			type: Number,
			required: [true, 'Podaj rok produkcji'],
			trim: true,
		},
		category: {
			type: String,
			required: [true, 'Podaj kategorię'],
			trim: true,
		},
		image: {
			type: Object,
			default: {},
		},
	},
	{
		timestamps: true,
	}
)

const Machine = mongoose.model('Machine', machineSchema)
module.exports = Machine
