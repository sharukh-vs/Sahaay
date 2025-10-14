const express = require('express');
const usersDB = require("../db")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const router = express.Router();

router.post("/register", async  (req, res) => {
    try {
        const {email, username, password } = req.body;
        console.log(username, password);
        const user = await usersDB.findOne({email})
        if(user) return res.status(400).json({msg: "User already exists with this email...Try logging in"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await usersDB.insert({email, username, password: hashedPassword});
        return res.status(201).json({
            msg: "User created successfully",
            user: newUser
        });
    
    } catch(error) {
        console.error("Register error", err);
        res.status(500).json({msg: `Error saving user ${error.message}`})
    }
})


// router.post("/register", (req, res) => {
//   console.log("Inside register route"); // <-- debug
//   res.json({ msg: "Register route working" });
// });

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await usersDB.findOne({email})
    if(!user) return res.status(400).json({msg: "No user exists with that email"})
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({msg: "Invalid credentials"});

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
    return res.status(200).json({token, username: user.username});
    
})

module.exports = router;