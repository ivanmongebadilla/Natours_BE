const express = require('express');
const userControler = require('./../controlers/userControler.js');
const authControler = require('./../controlers/authControler.js')

const router = express.Router();

router.post('/signup', authControler.signup);
router.post('/login', authControler.login);

router.post('/forgotPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);

router
    .route('/')
    .get(userControler.getAllUsers)
    .post(userControler.createUser)

router
    .route('/:id')
    .get(userControler.getUser)
    .patch(userControler.updateUser)
    .delete(userControler.deleteUser);

module.exports = router;
