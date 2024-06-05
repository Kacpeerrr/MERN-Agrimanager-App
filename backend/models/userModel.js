const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Podaj imię'],
		},
		email: {
			type: String,
			required: [true, 'Podaj adres e-mail'],
			unique: true,
			trim: true,
			match: [
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				'Podaj poprawny e-mail',
			],
		},
		password: {
			type: String,
			required: [true, 'Podaj hasło'],
			minLength: [6, 'Hasło musi zawierać minimum 6 znaków '],
			// maxLength: [32, 'Hasło nie może zawierać więcej niż 32 znaki'],
			match: [/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{6,}$/, 'Hasło musi posiadać: cyfrę, dużą i małą literę'],
		},
		photo: {
			type: String,
			required: [true, 'Dodaj zdjęcie'],
			default: 'https://cdn.vectorstock.com/i/500p/53/42/user-member-avatar-face-profile-icon-vector-22965342.jpg',
		},
		phone: {
			type: Number,
			default: '+48',
			unique: true,
			trim: true,
		},
		bio: {
			type: String,
			maxLength: [250, 'Opis nie może zawierać więcej niż 250 znaków'],
			default: 'Opis',
		},
	},
	{
		timestamps: true,
	}
)

// Encrypt password before saving to DB
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next
	}

	//Hash password
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(this.password, salt)
	this.password = hashedPassword
	next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
