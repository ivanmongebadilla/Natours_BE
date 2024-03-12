const crypto = require('crypto');
const { promisify } = require('util'); //JWT util promesify
const jwt = require('jsonwebtoken');
const User = require('../models/userModule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');


const signToken = id => {
    return (
        jwt.sign({ id: id }, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES_IN
        })
    )
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    //Implement and send a cookie
    res.cookie('jwt', token, cookieOptions);

    //Remove password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'succes',
        token: token,
        data: {
            user: user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
       return next(new AppError('Please provide email and password', 400))
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({email: email}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) if everthing ok, send token to client
    createSendToken(user, 200, res);

})

//MIDDLEWARE FUNCTION
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting the token and check if it is there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401))
    }

    // 2) Validate the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('User for this token does not exist any more', 401))
    }

    // 4) Check if user changed password after token was issued
    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Password has been changed', 401))
    }

    // Grant access to protected route
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    console.log(roles)
    return (req, res, next) => {
        // roles is an array containing admin and lead-guide
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have presmission to perform this action', 403))
        }

        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user with provided email', 404))
    }

    // 2) Generate random reset token
    const resetToken = user.correctPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message: message
        })
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch(err) {
        user.correctPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError(err.message, 500))
    }

   
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user base on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, 
                                    passwordResetExpires: { $gt: Date.now() } });

    //2) Set the new password if token has not expired and there is user
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password;    
    user.passwordConfirm = req.body.passwordConfirm;    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) Update changedPasswordAt property for current user
    // This will be managed by a pre middleware in userModule

    //4) Log user In, send JWT to client
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password');

    //2) Check if the POSTed password is correct
    if (!( await user.correctPassword(req.body.passwordCurrent, user.password))) {
        next (new AppError('Your current password is wrong', 401))
    }

    //3) If password is correct, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log the user in, send JWT
    createSendToken(user, 200, res);
})