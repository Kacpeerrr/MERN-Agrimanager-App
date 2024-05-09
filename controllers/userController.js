const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Token = require('../models/tokenModel')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

//Generate Token
const generateToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

//Register User
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body

	//Validation
	if (!name || !email || !password) {
		res.status(400)
		throw new Error('Wypełnij wszystkie wymagane pola')
	}
	if (password.length < 6) {
		res.status(400)
		throw new Error('Hasło musi posiadać 6 znaków')
	}

	//Check if user email alreay exists
	const userExists = await User.findOne({ email })

	if (userExists) {
		res.status(400)
		throw new Error('Użytkownik o takim mailu już istnieje')
	}

	//Create new user
	const user = await User.create({
		name,
		email,
		password,
	})

	//Generate Token
	const token = generateToken(user._id)

	//Send HTTP-only cookie
	res.cookie('token', token, {
		path: '/',
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400),
		sameSite: 'none',
		secure: true,
	})

	if (user) {
		const { _id, name, email, photo, phone, bio } = user
		res.status(201).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
			token,
		})
	} else {
		res.status(400)
		throw new Error('Niepoprawne dane użytkownika')
	}
})

//Login User
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body

	//Validate request
	if (!email || !password) {
		res.status(400)
		throw new Error('Podaj email i hasło')
	}

	//Check user exists
	const user = await User.findOne({ email })

	if (!user) {
		res.status(400)
		throw new Error('Użytkownik nie istnieje. Zarejestruj się!')
	}

	//User exists, check if password is correct
	const passwordIsCorrect = await bcrypt.compare(password, user.password)

	//Generate token
	const token = generateToken(user._id)

	if (passwordIsCorrect) {
		//Send HTTP-only cookie
		res.cookie('token', token, {
			path: '/',
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 86400), //1day
			sameSite: 'none',
			secure: true,
		})
	}

	if (user && passwordIsCorrect) {
		const { _id, name, email, photo, phone, bio } = user
		res.status(200).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
			token,
		})
	} else {
		res.status(400)
		throw new Error('Nieprawidłowy email lub hasło')
	}
})

//Logout
const logout = asyncHandler(async (req, res) => {
	res.cookie('token', '', {
		path: '/',
		httpOnly: true,
		expires: new Date(0),
		sameSite: 'none',
		secure: true,
	})
	res.status(200).json({ message: 'Wylogowałeś się!' })
})

//Get User
const getUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id)

	if (user) {
		const { _id, name, email, photo, phone, bio } = user

		res.status(200).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
		})
	} else {
		res.status(400)
		throw new Error('Użytkownik nie istnieje')
	}
})

//Get login status
const loginStatus = asyncHandler(async (req, res) => {
	const token = req.cookies.token
	if (!token) {
		return res.json(false)
	}

	//Verify Token
	const verified = jwt.verify(token, process.env.JWT_SECRET)
	if (verified) {
		return res.json(true)
	}
	return res.json(false)
})

//Update user
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id)

	if (user) {
		const { name, email, photo, phone, bio } = user
		user.email = email
		user.name = req.body.name || name
		user.phone = req.body.phone || phone
		user.bio = req.body.bio || bio
		user.photo = req.body.photo || photo

		const updateUser = await user.save()
		res.status(200).json({
			_id: updateUser._id,
			name: updateUser.name,
			email: updateUser.email,
			photo: updateUser.photo,
			phone: updateUser.phone,
			bio: updateUser.bio,
		})
	} else {
		res.status(404)
		throw new Error('Użytkownik nie istnieje')
	}
})

//Change password
const changePassword = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id)
	const { oldPassword, password } = req.body

	if (!user) {
		res.status(400)
		throw new Error('Użytkownik nie istnieje. Zarejestruj się!')
	}

	//Validate
	if (!oldPassword || !password) {
		res.status(400)
		throw new Error('Podaj stare i nowe hasło ')
	}
	// Check if old password matches in DB
	const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

	// Save new password
	if (user && passwordIsCorrect) {
		user.password = password
		await user.save()
		res.status(200).send('Nastąpiła zmiana hasła')
	} else {
		res.status(400)
		throw new Error('Stare hasło jest niepoprawne')
	}
})

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body
	const user = await User.findOne({ email })

	if (!user) {
		res.status(404)
		throw new Error('Użytkownik nie istnieje')
	}

	// Delete token if it exists in DB
	let token = await Token.findOne({ userId: user._id })
	if (token) {
		await token.deleteOne()
	}

	// Create Reset Token
	let resetToken = crypto.randomBytes(32).toString('hex') + user._id

	//Hash token before saving to DB
	const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

	// Save Token to DB
	await new Token({
		userId: user._id,
		token: hashedToken,
		createdAt: Date.now(),
		expiresAt: Date.now() + 40 * (60 * 1000), //40 minutes
	}).save()

	// Construct reset URL
	const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

	// Reset email
	const message = `
		<h2>Cześć ${user.name} - użytkowniku agrimanager.pl </h2>
		<p>Kliknij w link poniżej, aby zresetować swoje hasło.</p>
		<p>Link ważny jest tylko 40 minut.</p>
		<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		<p>Pozdrawiamy</p>
		<p>agrimanager.pl</p>
	`

	const subject = 'Zresetuj swoje hasło do agrimanager.pl'
	const send_to = user.email
	const sent_from = process.env.EMAIL_USER

	try {
		await sendEmail(subject, message, send_to, sent_from)
		res.status(200).json({ success: true, message: 'Email z linkiem do resetowania hasła został wysłany' })
	} catch (error) {
		res.status(500)
		throw new Error('Email niewysłany. Spróbuj ponownie!')
	}
})

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body
	const { resetToken } = req.params

	// Hash token, then compare to Token in DB
	const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

	//Find token in DB
	const userToken = await Token.findOne({
		token: hashedToken,
		expiresAt: { $gt: Date.now() },
	})

	if (!userToken) {
		res.status(404)
		throw new Error('Niepoprawny lub wygasły token')
	}

	//Find user
	const user = await User.findOne({ _id: userToken.userId })
	user.password = password
	await user.save()
	res.status(200).json({
		message: 'Hasło zesetowane. Zaloguj się!',
	})
})

module.exports = {
	registerUser,
	loginUser,
	logout,
	getUser,
	loginStatus,
	updateUser,
	changePassword,
	forgotPassword,
	resetPassword,
}
