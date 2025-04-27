const { AppError } = require('../utils/errors');
const { ValidationError } = require('sequelize');

const handleSequelizeError = (err) => {
    if (err instanceof ValidationError) {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        return new AppError('Validation Error', 400, errors);
    }
    return err;
};

const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors || undefined
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            error = handleSequelizeError(error);
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, res);
    }
};

module.exports = errorHandler; 