const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require("./models/User")
const cors=require('cors')
const app = express()
app.use(express.json())
app.use(cors())
require('dotenv').config();


const connectToMongodb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")
    }
    catch (error) {
        console.error("Error connecting to MongoDB", error)
        process.exit(1)
    }
}

connectToMongodb()


app.get("/", (req, res) => {
    res.send("Hello, World!, This is for testing purposes")
})

app.post("/register", async (req, res) => {
    const { username, email, password, fullname, gender } = req.body
    const existingUserByUsername = await User.findOne({ username: username });
    const existingUserByEmail = await User.findOne({ email: email });

    if (existingUserByUsername) {
        return res.status(400).send({ "error_msg": "Username already exists" });
    }

    if (existingUserByEmail) {
        return res.status(400).send({ error_msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const newUser = await User.create({
            username,
            email,
            fullname,
            gender,
            password: hashedPassword
        });
        res.status(201).send({ message: 'User created successfully!', user: { username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error_msg: 'Error creating user' });
    }


})


app.post("/login", async (req, res) => {
    const { username, password } = req.body
    try {
        const existingUser = await User.findOne({ username })
        if (!existingUser) {
            return res.status(404).send({ error_msg: "User not found" })
        }
        const isPasswordMatched = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordMatched) {
            return res.status(401).send({ error_msg: "Password is not correct" })
        }
        const jwtToken = jwt.sign(
            { userId: existingUser._id, username: existingUser.username },
            process.env.JWT_SECRET,

        );
        return res.send({ message: "User logged in successfully", jwtToken })
    }
    catch (error) {
        console.error(error)
        res.status(500).send({ error_msg: "Error logging in user" })
    }

})

app.post("/forgotPassword", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        

        if (!user) {
            return res.status(404).send({ error_msg: "Email not found" })

        }
        const userPassword = user.password

        const isSamePassword = await bcrypt.compare(password, userPassword)
        if (isSamePassword) {
            return res.status(400).send({ error_msg: "Passwords should not be the same" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        await User.findOneAndUpdate(user._id, { $set: { password: hashedPassword } }, { new: true })
        return res.status(200).send({ message: "Password updated successfully!" });
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error_msg: "Error updating password" });
    }
})


app.listen(3004, () => {
    console.log("Server running on port 3004")
})