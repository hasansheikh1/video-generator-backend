const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {

    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]

        try {
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET)
                console.log("decoded", decode)
                const user = await User.findById(decode?.id)
                // console.log("user",user);
                req.user = user;
                next();
            }

        } catch (error) {
            throw new Error("Not Authorized")
        }
    }
    else {
        throw new Error("There is no token attached to header")
    }

}
)

const isAdmin = asyncHandler(async (req, res, next) => {

    // console.log("request user", req.user)
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role != 'admin') {
        throw new Error("You're not an admin")
    }
    else {
        next();
    }
})


module.exports = { authMiddleware, isAdmin };