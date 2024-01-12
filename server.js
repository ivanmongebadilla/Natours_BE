const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught Exceptions 
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down!');
    console.log(err.name, err.message);
    process.exit(1);

})

dotenv.config({path: './config.env'});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('DB connection succesful');
})

const port = process.env.PORT || 3000;
app.listen(port , () => {
    console.log(`Running on port ${port}....`)
});

// ERRORS OUTSIDE EXPRESS
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})
