const express = require('express');
const { createUser, loginUserCtrl,
    getAllUsers, getUser,
    deleteUser, updateUser,
    unBlockUser, blockUser,
    handleRefreshToken, logout,
    updatePassword, forgotPasswordToken,
    resetPassword } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { reset } = require('nodemon');
const router = express.Router();


router.post('/register', createUser);
router.put('/password', authMiddleware, updatePassword)
router.post('/forgot-password-token', forgotPasswordToken)
router.put('/reset-password/:token', resetPassword)
router.post('/login', loginUserCtrl);
router.get('/all-users', getAllUsers);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.delete('/:id', deleteUser);
router.put('/edituser', authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser);



module.exports = router;