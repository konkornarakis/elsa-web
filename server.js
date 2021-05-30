if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path');

// Database
const config = require('./config')
const mongoClient = require('mongodb').MongoClient
const cors = require('cors')

//that get us connected to the db and provide us with the collection
mongoClient.connect(`mongodb://${config.dbhost}`, {
    userNewUrlParser: true,
    useUnifiedTopology: true,
}).then(client => {
    const db = client.db(config.dbName)
    const collection = db.collection(config.dbCollection)
    app.locals[config.dbCollection] = collection
})


const initializePassport = require('./passport-config');
const { MongoClient } = require('mongodb');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [{ id: 1, name: 'Konstantinos', email: 'k@k', password: '1', availability: [] }]
const orders = []
const availability = []

app.use('/views', express.static(__dirname + "/views"));
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
// middleware to make the collection easily available to all of our routes
app.use(cors())
app.use((req, res, next) => {
    const collection = req.app.locals[config.dbCollection]
    req.collection = collection
    next()
})

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
})

app.get('/create', checkAuthenticated, (req, res) => {
    console.log(req.user.name)
    res.render('create.ejs', { name: req.user.name })
})

app.post('/create', checkAuthenticated, (req, res) => {
    console.log("parcelname: " + req.body.parcelname + ", username: " + req.user.name)
    //console.log(u)
    orders.push({
        id: Date.now().toString(),
        name: req.body.parcelname
    })

    res.render('create_completed.ejs', { name: req.user.name, parcelname: req.body.parcelname })
    // res.redirect('/create_completed.ejs', { name: 'test', parcelname: req.body.parcelname })
})  

app.get('/availability', checkAuthenticated, (req, res) => {
    let u = users.find(user => user.name === req.user.name)
    console.log(u)

    console.log('printing availability')
    for (let i = 0; i < u.availability.length; i++) {
        console.log(u.availability[i].availabilityStart)
    }

    res.render('availability.ejs', { name: req.user.name, u });
})

app.post('/availability', checkAuthenticated, (req, res) => {
    // console.log('POST request, availability')
    // console.log(req.body)
    let u = users.find(user => user.name === req.user.name)
    u.availability.push({
        availabilityStart: req.body.availabilityStart,
        availabilityEnd: req.body.availabilityEnd,  
    })
    console.log(u)
    // constole.log(users.find(user => user.name === req.user.name))
    res.render('availability.ejs', { name: req.user.name, users });
})

app.get('/history', checkAuthenticated, (req, res) => {
    res.render('history.ejs', {orders})
})

app.get('/home', (req, res) => {
    res.render('home.ejs')
})

app.delete('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000);