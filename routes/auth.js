const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'parthikis$boy';

// Route 1: create a user using: POST : "/api/auth/createuser" .no login required
router.post('/createuser', [
    // Define validation rules using the 'check' function
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')

], async (req, res) => {
    let success = false;
    // if there is errors, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success , errors: errors.array() });
    }
    //check email exist already
    try {


        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success , error: "a user with this email already exists" })
        }

        const salt = await bcrypt.genSaltSync(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //create new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success =true;
        res.json({ success ,authtoken })
        //catch errorg
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error accured");
    }

})

//Route 2: Authenticate a user using :post "/api/auth/login".
router.post('/login', [

    // Define validation rules using the 'check' function
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').exists().withMessage('password can not be blank'),
], async (req, res) => {
    let success= false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors if there are any
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success ,error: 'try to login with correct credentials' });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({ success ,authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// Route 3 : get logedin user details using : POST "api/auth/getsuer", login required 
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("password");
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");

    }
})
module.exports = router;