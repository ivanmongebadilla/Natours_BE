const express = require('express');
// const fs = require('fs');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlers/errorControler');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//MIDDLEWEARE middleware are run as they are one before the other 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


app.use(express.json());

//Serving Static Files
app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//     console.log('Hello Middleware');
//     next();
// })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
})


// DEFINDING PORTS
// app.get('/', (req, res) => {
//     res.status(200).json({message: 'Hello from the server side', app: 'Natures'});
// })

// app.post('/', (req, res) => {
//     res.send('You can post to this endpoint')
// })

// ROUTE HANDLERS
// const getAllTours = (req, res) => {
//     console.log(req.requestTime)
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours: tours
//         }
//     })
// }

// const getTour = (req, res) => {
//     console.log(req.params)

//     const id = req.params.id * 1;
//     const tour = tours.find((el) => { return el.id === id })

//     if (!tour){
//         return res.status(404).json({
//             status: 'Fail',
//             message: 'Invalid ID'
//         })
//     } else {

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour: tour
//             }
//         })
//     }
// }

// const createTour = (req, res) => {
//     // console.log(req.body);

//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({id: newId}, req.body);

//     tours.push(newTour);

//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     })
// }

// const updateTour = (req, res) => {
//     const id = req.params.id * 1;
//     const tour = tours.find((el) => { return el.id === id })

//     if (!tour){
//         return res.status(404).json({
//             status: 'Fail',
//             message: 'Invalid ID'
//         })
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: '<Updated Tour here>'
//         }
//     })
// }

// const deleteTour = (req, res) => {
//     const id = req.params.id * 1;
//     const tour = tours.find((el) => { return el.id === id })

//     if (!tour){
//         return res.status(404).json({
//             status: 'Fail',
//             message: 'Invalid ID'
//         })
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// }

// const getAllUsers = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     })
// }

// const getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     })
// }

// const createUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     })
// }

// const updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     })
// }

// const deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     })
// }

//READING TOURS-SIMPLE.JSON DATA
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// )

// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// ROUTES you can set the route and specify what function to run in each request type

        //Mounting the routers
// const tourRouter = express.Router();
// const userRouter = express.Router();
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

// Unhandled Routes Error
app.all('*', (req, res, next) => {

    // const err = new Error(`Can find ${req.originalUrl} on the server`)
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can find ${req.originalUrl} on the server`, 404));
});

// By using err, Express will recognize it as a error handler middleware
app.use(globalErrorHandler);

// tourRouter
//     .route('/')
//     .get(getAllTours)
//     .post(createTour)

// tourRouter
//     .route('/:id')
//     .get(getTour)
//     .patch(updateTour)
//     .delete(deleteTour)

// userRouter
//     .route('/')
//     .get(getAllUsers)
//     .post(createUser)

// userRouter
//     .route('/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);

//SERVER START
// const port = 3000;
// app.listen(port , () => {
//     console.log(`Running on port ${port}....`)
// });

module.exports = app;
