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
const path = require('path')
const { 
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [{ id: 1, name: 'Konstantinos', email: 'k@k', password: '1', availability: [] }]
const orders = []
const toDeliver = []
const toReceive = []

// app.use(express.cookieParser('secret'));
// app.use(express.cookieSession());
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

// Database stuff
var sql = require('mssql');
const { create } = require('domain');

var sqlConfig = {
    user: 'elsa',
    password: 'elsa',
    server: `79.131.185.146`,  
    database: 'Elsa',
    trustServerCertificate: true,
};

app.get('/s', (req, res) => {
    // (async function () {
    //     try {
    //         console.log("sql connecting...")
    //         console.log(`INSERT INTO [Elsa].[dbo].[Test] VALUES (100, 'Michael');`)
    //         let pool = await sql.connect(sqlConfig)
    //         let result = await pool.request()
    //             .query(`INSERT INTO [Elsa].[dbo].[Orders] VALUES ('${uuidv4()}', 'test_packet1', '789', 'Sender_address', 'Receiver_id', 'Receiver_address', 'Deliver_id', GETDATE(), 'CREATED', GETDATE(), NULL, NULL, NULL, NULL, NULL, NULL);`)
    //         console.log('sql results: ')
    //         console.log(result)
    //     } catch (err) {
    //         console.log(err);
    //     }
    // })()
})


// end of database stuff

app.get('/', checkAuthenticated, (req, res) => {
    console.log('rendering index.ejs')
    res.render('index.ejs', { name: req.user.name });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    console.log('rendering login.ejs')
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    console.log('rendering register.ejs')
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

        (async function () {
            try {
                console.log("sql connecting...")
                let pool = await sql.connect(sqlConfig)
                let result = await pool.request()
                    .query(`INSERT INTO [Elsa].[dbo].[Users] VALUES ('${uuidv4()}', '${req.body.name}', '${req.body.email}', '${req.body.hashedPassword}');`)
                console.log('sql results: ')
                console.log(result)
            } catch (err) {
                console.log(err);
            }
        })()
        console.log('redirecting to login.ejs')
        res.redirect('/login')
    } catch {
        console.log('rendering register.ejs')
        res.redirect('/register')
    }
})

app.get('/create', checkAuthenticated, (req, res) => {
    console.log('rendering create.ejs')
    res.render('create.ejs', { name: req.user.name })
})

app.post('/create', checkAuthenticated, (req, res) => {
    // console.log("parcelname: " + req.body.parcelname + ", username: " + req.user.name)
    //console.log(u)
    // orders.push({
    //     id: Date.now().toString(),
    //     name: req.body.parcelname
    // })

    (async function () {
        try {
            console.log("sql connecting...")
            console.log(`INSERT INTO [Elsa].[dbo].[Orders] VALUES ('${uuidv4()}', '${req.body.parcelname}', '${req.user.id}', '${req.body.sendersAddress}', (SELECT TOP 1 id FROM [Elsa].[dbo].[Users] WHERE email = '${req.body.receiversEmail}'), '${req.body.receiversAddress}', 'Deliver_id', GETDATE(), 'CREATED', GETDATE(), NULL, NULL, NULL, NULL, NULL, NULL, NULL);`)
            let pool = await sql.connect(sqlConfig)
            let result = await pool.request()
                .query(`INSERT INTO [Elsa].[dbo].[Orders] VALUES ('${uuidv4()}', '${req.body.parcelname}', '${req.user.id}', '${req.body.sendersAddress}', (SELECT TOP 1 id FROM [Elsa].[dbo].[Users] WHERE email = '${req.body.receiversEmail}'), '${req.body.receiversAddress}', 'Deliver_id', GETDATE(), 'CREATED', GETDATE(), NULL, NULL, NULL, NULL, NULL, NULL, NULL);`)
            console.log('sql results: ')
            console.log(result)
            console.log('rendering create_completed.ejs')
            res.render('create_completed.ejs', { name: req.user.name, parcelname: req.body.parcelname, msg:'Success' })
        } catch (err) {
            console.log(err);
            console.log('FAILURE')
            res.render('create_completed.ejs', { name: req.user.name, parcelname: req.body.parcelname, msg:'Failed' })
        }
    })()
    // res.redirect('/create_completed.ejs', { name: 'test', parcelname: req.body.parcelname })
}) 

app.get('/orders_created', checkAuthenticated, (req, res) => {

    (async function () {
        try {
            console.log("sql connecting...")
            console.log(`SELECT name, date_created, current_status, (SELECT TOP 1 name FROM [Elsa].[dbo].[Users] WHERE id = '${req.user.id}'), sender_address, (SELECT TOP 1 name FROM [Elsa].[dbo].[Users] WHERE id = receiver_id), receiver_address, 'deliver_id' FROM [Elsa].[dbo].[Orders] WHERE sender_id = '${req.user.id}');`)
            let pool = await sql.connect(sqlConfig)
            let result = await pool.request()
                .query(`INSERT INTO [Elsa].[dbo].[Orders] VALUES ('${uuidv4()}', '${req.body.parcelname}', '${req.user.id}', '${req.body.sendersAddress}', (SELECT TOP 1 id FROM [Elsa].[dbo].[Users] WHERE email = '${req.body.receiversEmail}'), '${req.body.receiversAddress}', 'Deliver_id', GETDATE(), 'CREATED', GETDATE(), NULL, NULL, NULL, NULL, NULL, NULL, NULL);`)
            console.log('sql results: ')
            console.log(result)
            console.log('rendering create_completed.ejs')
            res.render('create_completed.ejs', { name: req.user.name, parcelname: req.body.parcelname, msg:'Success' })
        } catch (err) {
            console.log(err);
            console.log('FAILURE')
            res.render('create_completed.ejs', { name: req.user.name, parcelname: req.body.parcelname, msg:'Failed' })
        }
    })()
    // res.redirect('/create_completed.ejs', { name: 'test', parcelname: req.body.parcelname })
})



app.get('/availability', checkAuthenticated, (req, res) => {
    let u = users.find(user => user.name === req.user.name)
    // console.log(u)

    let msg = null;

    // console.log('printing availability')
    for (let i = 0; i < u.availability.length; i++) {
        console.log(u.availability[i].availabilityStart)
    }

    console.log('rendering availability.ejs')
    res.render('availability.ejs', { name: req.user.name, u, error: msg});
})

app.post('/availability', checkAuthenticated, (req, res) => {
    // console.log('POST request, availability')
    // console.log(req.body)
    let u = users.find(user => user.name === req.user.name)

    let newStart = req.body.availabilityStart
    let newEnd = req.body.availabilityEnd

    let msg = 'Success. Availability added.'; 

    for (let i = 0; i < u.availability.length; i++) {
        let start = u.availability[i].availabilityStart 
        let end = u.availability[i].availabilityEnd

        if (newStart < end) {
            console.log('newStart < end, failed to push availability')
            msg = "Failed. Availability conflict"
            break;
        }
    }

    if (msg != 'Failed. Availability conflict')
        u.availability.push({
            availabilityStart: req.body.availabilityStart,
            availabilityEnd: req.body.availabilityEnd,  
        })
    // console.log(u)
    // constole.log(users.find(user => user.name === req.user.name))
    console.log('rendering availability.ejs')
    res.render('availability.ejs', { name: req.user.name, u, error: msg });
})

app.get('/history', checkAuthenticated, (req, res) => {

    //get data for orders created
    let created = '', received = '', delivered = '';
    (async function () {
        try {
            console.log("sql connecting...")
            let pool = await sql.connect(sqlConfig)
            created = await pool.request()
                .query(`SELECT o.name as name, date_created, current_status, s.name as sender_name, o.sender_address as sender_address, r.name as receiver_name, o.receiver_address as receiver_address, d.name as deliver_name
                FROM [Elsa].[dbo].[Orders] o
                INNER JOIN [Elsa].[dbo].[Users] s on s.id = o.sender_id
                INNER JOIN [Elsa].[dbo].[Users] r on r.id = o.receiver_id
                INNER JOIN [Elsa].[dbo].[Users] d on d.id = o.receiver_id
                WHERE o.sender_id = '${req.user.id}'`)
            
            received = await pool.request()
                .query(`SELECT o.name as name, date_created, current_status, s.name as sender_name, o.sender_address as sender_address, r.name as receiver_name, o.receiver_address as receiver_address, d.name as deliver_name
                FROM [Elsa].[dbo].[Orders] o
                INNER JOIN [Elsa].[dbo].[Users] s on s.id = o.sender_id
                INNER JOIN [Elsa].[dbo].[Users] r on r.id = o.receiver_id
                INNER JOIN [Elsa].[dbo].[Users] d on d.id = o.receiver_id
                WHERE o.receiver_id = '${req.user.id}'`)

            delivered = await pool.request()
                .query(`SELECT o.name as name, date_created, current_status, s.name as sender_name, o.sender_address as sender_address, r.name as receiver_name, o.receiver_address as receiver_address, d.name as deliver_name
                FROM [Elsa].[dbo].[Orders] o
                INNER JOIN [Elsa].[dbo].[Users] s on s.id = o.sender_id
                INNER JOIN [Elsa].[dbo].[Users] r on r.id = o.receiver_id
                INNER JOIN [Elsa].[dbo].[Users] d on d.id = o.receiver_id
                WHERE o.deliver_id = '${req.user.id}'`)
            console.log('sql results: ')
            created = created.recordset
            received = received.recordset
            delivered = delivered.recordset

            console.log('printing results')
            console.log(created)
            console.log(received)
            console.log(delivered)
            console.log('done printing results')
            res.render('history.ejs', { created: created, received: received, delivered: delivered  })
        } catch (err) {
            console.log(err);
            console.log('FAILURE')
            res.render('history.ejs', { created: 'error', received: 'error', delivered: 'error'  })
        }
        // res.render('history.ejs', { created: created, received: received, delivered: delivered  })
    })();
})

app.get('/job', checkAuthenticated, (req, res) => {
    console.log('rendering job.ejs')
    res.render('job.ejs')
})

app.get('/getjob', checkAuthenticated, (req, res) => {
    let response = '';
    let response2 = '';
    (async function () {
        try {
            console.log("sql connecting...")
            let pool = await sql.connect(sqlConfig)
            response = await pool.request()
                .query(`SELECT TOP 1 id
                FROM [Elsa].[dbo].[Orders] o
                WHERE current_status = 'CREATED' AND deliver_id IS NULL AND sender_id != '${req.user.id}' AND receiver_id != '${req.user.id}'`)
            
            console.log('sql results: ')
            response = response.recordset
            console.log(response)
            console.log('done printing results')
            if (response.length ==- 0) {
                console.log('sadly, no jobs')
                response = 'fail'
            } else {
                console.log("found a job :), order with id: " + response[0].id)
                response2 = await pool.request()
                    .query(`UPDATE [Elsa].[dbo].[Orders]
                    SET deliver_id = '${req.user.id}' , current_status = 'ASSIGNED', status_assigned = GETDATE()
                    WHERE id = '${response[0].id}';`)
            }
            console.log('rendering getjob.ejs')
            res.render('result_job.ejs', { response: response })
        } catch (err) {
            console.log(err);
            console.log('FAILURE')
            console.log('rendering getjob.ejs')
            res.render('result_job.ejs', { response: 'fail' })
        }
    })();
})

app.get('/home', (req, res) => {
    console.log('rendering home.ejs')
    res.render('home.ejs')
})

app.delete('/logout', (req, res) => {
    req.logout()
    console.log('redirecting to login.ejs')
    res.redirect('/login')
})

//always last
app.get('*', (req, res) => {
    res.status(404)
    console.log('rendering notfound.ejs')
    res.render('notfound.ejs')
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

app.listen(process.env.PORT || 5000);