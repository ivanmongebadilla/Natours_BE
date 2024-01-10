const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit ='5'
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,reatingAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // // 1) Filtering
        // const queryObj = {...req.query} //creates new object (hard copy)
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el])

        // // 2) Advanced filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        // let query = Tour.find(JSON.parse(queryStr));

        // // 3) Sorting
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('-createdAt');
        // }
        
        // // 4) Field Limiting
        // console.log(req.query.fields)
        // if (req.query.fields) {
        //     // const fields = req.query.fields.spl(',').join(' ');
        //     const fields = req.query.fields.split(',').join(' ');
        //     console.log(fields);
        //     query = query.select(fields)
        // } else {
        //     query = query.select('-__v')
        // }

        // // 5) Pagination
        // const page = req.query.page * 1 || 1; //String to a number || by default 1
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;
        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments(); // return number of documents
        //     if (skip >= numTours) throw new Error("This page does not exist")
        // }

        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');

        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitField()
            .paginate();
        const tours = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        })
    } catch(err) {
        res.status(404).json({
            status: "Fail",
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id)

    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: "Fail",
            message: err
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour ({})
        // newTour.save();

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "Fail",
            message: err
        })
    }
 }

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: "Fail",
            message: err
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch(err) {
        res.status(404).json({
            status: 'Fail',
            message: err
        })
    }
}

exports.getTourStats = async (req, res) => {
    try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { avgPrice: 1 }
        }
        // {
        //   $match: { _id: { $ne: 'EASY' } }
        // }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1 // Transform string to a number

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12 // This is for reference
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan: plan
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'Fail',
            message: err
        })
    }
}