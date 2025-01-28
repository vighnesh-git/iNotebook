const express = require('express');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const JWT_SECRET = 'vighneshislearningmernstack'

//Route 1: create a user using : POST "/api/auth/createuser".  NO login required
router.post('/createuser',
    [
        body('name','Enter a valid data').isLength({ min:3 }),
        body('email','Enter a valid data').isEmail(),
        body('password','password must be atleast 5 characters').isLength({ min:5 }),
    ], async (req, res) => {
        let success =  false;
    // if error return bad request & errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    // check if user is exits or not
    try{
        let user = await User.findOne({ email : req.body.email })
        if(user){
            return res.status(400).json({success, error: "email already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password ,salt);

        //create a new user
        user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : secPass
        });

        const data = {
            user:{
                id : user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);

        // res.json(user)
        success = true;
        res.json({ success, authtoken })

    } catch (error){
        console.error(error.message);
        res.status(500).send("Server error");
    }
})

//Route 2: Authenticate a user using : POST "/api/auth/login".  NO login required
router.post('/login',
    [
        // body('name','Enter a valid data').isLength({ min:3 }),
        body('email','Enter a valid data').isEmail(),
        body('password','password cannot be blank').exists(),
    ],  async (req, res) => {
        let success = false;
        // if error return bad request & errors 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {email,password} = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                success = false;
                return res.status(400).json({error: "Incorrect details"});
            }
            const passwordcompare = await bcrypt.compare(password, user.password)
            if(!passwordcompare){
                success = false;
                return res.status(400).json({  success, error: "Incorrect details"});
            }
            
            const data = {
                user : {
                   id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            // res.json(user)
            res.json({success , authtoken})

        } catch  (error){
            console.error(error.message);
            res.status(500).send("Server error");
        }
    })
//Route 3: Get loggedin user details using : POST "/api/auth/getuser".  Login required
router.post('/getuser', fetchuser, async (req, res) => {
    
    try {
        userid  = req.user.id;
        const user = await User.findById(userid).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
})


module.exports = router 