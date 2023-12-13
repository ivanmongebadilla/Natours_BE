const mongoose = require('mongoose');

const dotenv = require('dotenv');
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

const tourSchema = new mongoose.Schema({ //THIS SI THE SCHEMA 
    name: {
        type: String,
        required: [true, "Tour must have a name"],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, "Tour must have a price"]
    }
})
const Tour = mongoose.model('Tour', tourSchema)//THIS IS THE MODEL. Model names start with uppercase

const testTour = new Tour({
    name: "The Forest Hiker",
    rating: 4.7,
    price: 497
})

testTour.save().then(doc => {
    console.log(doc)
}).catch(err => {
    console.log(err)
})

const port = process.env.PORT || 3000;
app.listen(port , () => {
    console.log(`Running on port ${port}....`)
});
