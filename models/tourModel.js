const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({ //THIS SI THE SCHEMA 
    name: {
        type: String,
        required: [true, "Tour must have a name"],
        trim: true,
        unique: true
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "Tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, " Tour must have difficulty"]
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Tour must have a price"]
    },
    priceDiscount: {
        type: Number,
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "Tour must have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "Tour must have image cover"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date]
})
const Tour = mongoose.model('Tour', tourSchema)//THIS IS THE MODEL. Model names start with uppercase

module.exports = Tour;