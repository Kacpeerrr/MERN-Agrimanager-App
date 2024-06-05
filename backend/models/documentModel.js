const mongoose = require('mongoose')

const documentSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		name: {
			type: String,
			required: [true, 'Podaj nazwę dokumentu'],
			trim: true,
		},
		documentNumber: {
			type: String,
			required: [true, 'Podaj numer dokumentu'],
			trim: true,
		},
		paymentDate: {
			type: Date,
			required: [true, 'Podaj termin płatności'],
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

const Document = mongoose.model('Document', documentSchema)
module.exports = Document
