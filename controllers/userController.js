const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

	//Send HTTP-only cookie
	res.cookie('token', token, {
		path: '/',
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400), //1day
		sameSite: 'none',
		secure: true,
	})

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
	res.status(200).json({ message: 'Wylogowałeś się!'})
})

//Get User
const getUser = asyncHandler(async (req, res) => {
	res.send('Get User Data')
})

module.exports = {
	registerUser,
	loginUser,
	logout,
	getUser,
}
