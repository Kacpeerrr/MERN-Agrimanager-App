const mongoose = require('mongoose')

const fieldSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: [true, 'Podaj nazwę pola'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Podaj lokalizację pola'],
            trim: true,
        },
        fieldNumber: {
            type: String,
            required: [true, 'Podaj numer działki'],
            trim: true,
        },
        surface: {
            type: Number,
            required: [true, 'Podaj powierzchnię pola'],
            trim: true,
        },
        currentPlant: {
            type: String,
            required: [true, 'Podaje aktualną uprawę'],
            trim:true,
        },
        sowingDate: {
            type: Date,
            required: [true, 'Podaj datę zasiewu'],
            trim:true,
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

const Field = mongoose.model('Field', fieldSchema)
module.exports = Field