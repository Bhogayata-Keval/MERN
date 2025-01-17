const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../../models/User');
const keys = require('../../config/keys');
const passport = require('passport');

// router.get('/test', (req, res) => res.json({msg:'test success'}));

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
// @route  GET /api/user/register
// @desc   Register User
// @access Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
         if(user) {
             return res.status(400).json({email:'Email Already Exists'});
         } else {
             const avatar = gravatar.url(req.body.email,{
                 s: '200', // size
                 r: 'pg', // rating
                 d: 'mm'
             });
             const newUser = new User({
                 name: req.body.name,
                 email: req.body.email,
                 avatar: avatar,
                 password: req.body.password,
             });

             bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }
                    newUser.password = hash;
                    newUser.save().then(user => {
                        res.json(user);
                    }).catch(err => console.log(err));
                });
             });
         }
    });
});

// @route  GET /api/user/login
// @desc   Register User
// @access Public
router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
           if (!user) {
               errors.email = 'User not found'
               return res.status(404).json(errors);
           }

           bcrypt.compare(password, user.password).then(isMatch => {
                if(isMatch) {
                    // res.json({msg: 'success'});
                    const payload = { id: user.id, name: user.name, avatar: user.avatar };
                    jwt.sign(payload, keys.secretOrKey, {expiresIn : 3600}, (err, token) => {
                        res.json({success: true, token: 'Bearer '+token })
                    });
                } else {
                    errors.password = 'Password Incorrect';
                    return res.status(400).json(errors);
                }
           });
        });
});

// @route  GET /api/user/register
// @desc   Register User
// @access Public
router.post('/current', passport.authenticate('jwt', {session: false}), (req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;
