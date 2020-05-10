
const express = require ('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const routes = require('./routes/routes');
const mongoose =require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

require('./config/passport')(passport);

//Db config
const db = require('./config/keys').MongoURI;


// connect to mongo
mongoose.connect(db, { useUnifiedTopology: true,  useCreateIndex: true, useNewUrlParser: true })
.then(()=>console.log('Mongo Db Connected...'))
.catch(err=>console.log(err));

//Body parser
app.use(express.urlencoded({ extended:false }));

//Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

//global variable for success and error
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})


const expressLayouts = require('express-ejs-layouts');

//EJS
app.use(expressLayouts);
app.set('view engine','ejs');


app.use(routes);

server.listen(port, () => {                                // listening on port using server funtion
    console.log('Server started on port ' + port);
})




