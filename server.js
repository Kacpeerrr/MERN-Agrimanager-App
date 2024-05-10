const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv').config()
const cookieParser = require("cookie-parser")
const userRoute = require('./routes/userRoute')
const contactRoute = require('./routes/contactRoute')
const errorHandler = require('./middlewares/errorMiddleware')
const path = require('path');

const app = express()

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//Routers Middlewares
app.use('/api/users', userRoute)
app.use('/api/contactus', contactRoute)

//Routes
app.get('/', (req, res) => {
    res.send('Home Page')
})

//Error Middlewares
app.use(errorHandler)

//Connect to DB and start server
const PORT = process.env.PORT || 3000
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serwer działa na porcie: ${PORT}`);
        })
    })
    .catch(err => console.log(err))