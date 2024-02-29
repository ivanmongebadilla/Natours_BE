const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({ //THIS SI THE SCHEMA 
    name: {
        type: String,
        required: [true, "Tour must have a name"],
        trim: true,
        unique: true,
        maxlength: [40, 'A tour name must have less or equal thn 40 characters'],
        minlength: [10, 'A tour name must have more or equal thn 10 characters']
    }, slug: {
        type: String
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
        required: [true, " Tour must have difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']
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
        validate: {
            validator: function(val) {
                return val < this.price
            },
            message: 'Discount should be below the regular price'
        }
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
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

tourSchema.virtual('durationWeeks').get(function() { // This cannot be used in query 
    return this.duration / 7;
})

// Document middleware pre, runs before .save() and .create() 
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
}) //Mongoose middleware

// Document middleware post
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

//Query Middleware pre
tourSchema.pre(/^find/, function(next) { // /^find/ to apply this middleware with all query functions that starts with find
    this.find({ secretTour: {$ne: true}})
    next();
})

//Query Middleware post
tourSchema.post(/^find/, function(docs, next) {
    //console.log(docs);
    next();
})


//Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: {$ne: true}}})
    //console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', tourSchema)//THIS IS THE MODEL. Model names start with uppercase

module.exports = Tour;