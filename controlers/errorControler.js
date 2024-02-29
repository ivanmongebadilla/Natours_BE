const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.patch}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    
    const message = `Duplicate field value ${value[0]}. Please use another value`;
    return new AppError(message, 400);
}

const handleJWTExpiredError = (err) => {
    return new AppError('Your token has expired. Please log in again', 401);
}

const handleJWTError = (err) => {
    return new AppError('Invalid Token. Please log in again', 401);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid Input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // Operational error
    if (err.isOerational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    // Programming or other unknown error
    } else {
        // 1) Log error
        console.error('Error', err)

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        console.log('Dev')
        sendErrorDev(err, res);

    } else if (process.env.NODE_ENV === 'production') {
        console.log('Prod')
        let error = {...err};
        
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error, res);
    }

}