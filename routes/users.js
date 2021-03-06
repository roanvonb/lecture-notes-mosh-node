const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => { 
    const user = await User
    .findById(req.user.id)// look up user by their decoded jwt (by auth middleware)
    .select('-password'); // exclude sending password
    res.send(user);
});

// register
router.post('/', async (req, res) => {

    // check valid input
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    // check user already registered
    let user = await User.findOne({email:req.body.email});
    if (user) return res.status(400).send('User already registered');

    // create user
    // user = new User({
    //     name:req.body.name,
    //     email:req.body.email,
    //     password:req.body.password
    // }); // instead of this, shorthand with lodash pick is:

    user = new User(_.pick(req.body,['name','email','password']));

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);

    await user.save();

    // generate auth token
    const token = user.generateAuthToken();

    // send to client
    res
    .header('x-auth-token',token) // prefix custom headers with x-
    .send(_.pick(user,['id','name','email'])); 
});

module.exports = router;