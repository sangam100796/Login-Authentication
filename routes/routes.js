
const express = require('express');
const router = express.Router();
const userRoutes = require('./users')
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const {ensureAuthenticated} =require('../config/auth');

router.get('/', (req, res) => {
    res.render('welcome');
});


router.get('/users/login', (req, res) => {
    res.render('login');
});

router.get('/users/register', (req, res) => {
    res.render('register');
});

router.get('/dashboard',ensureAuthenticated ,(req, res) => {
    res.render('dashboard');
});

router.post('/users/register', (req, res) => {

    const { name, email, username, password, password2 } = req.body;

    let errors = [];

    // check required fields 
    if (!name || !email || !username || !password || !password2) {
        errors.push({ msg: 'Please Fill in All the Fields' });
    }

    //check password match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //check password length
    if (password.length < 6) {
        errors.push({ msg: 'Passwords should be atleast 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            username,
            password,
            password2
        });
    }
    else {
        //validation passed
        User.findOne({ username: username })
            .then(user => {
                if (user) {
                    //user exists
                    errors.push({
                        msg: 'Username Already Exits'
                    });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        username,
                        password,
                        password2
                    });
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        username,
                        password
                    });

                    //hash the password
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.password,salt,(err,hash)=>{
                            if(err)throw err;
                                newUser.password=hash;
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg','You are registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => { console.log(err) });
                        })
                    });
                }
            });

    }

});

router.post('/users/login', (req, res, next) => {
    passport.authenticate('local', 
    { 
        successRedirect: '/dashboard',
        failureRedirect: '/users/login' ,
        failureFlash:true
    })(req,res,next);
});

//logout handle
router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success_msg','You are logged Out');
    res.redirect('/users/login');
})

module.exports = router