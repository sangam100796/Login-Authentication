const localStrtegy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//load usr model

const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new localStrtegy({ usernameField: 'username' }, (username, password, done) => {
            //match user
            User.findOne({ username: username })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Invalid Username' });
                    }

                    // Match the password 
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            throw err;
                        }
                        if (isMatch) {
                            return done(null, user);
                        }
                        else {
                            return done(null, false, { message: 'Incorrect password' });
                        }
                    })
                })
                .catch(err => {
                    throw err;
                })
        })
    );
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}