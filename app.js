const express = require('express');
const fs = require('fs');

const app = express();

//MIDDLEWEARE
app.use(express.json());

// DEFINDING PORTS
// app.get('/', (req, res) => {
//     res.status(200).json({message: 'Hello from the server side', app: 'Natures'});
// })

// app.post('/', (req, res) => {
//     res.send('You can post to this endpoint')
// })

//READING TOURS-SIMPLE.JSON DATA
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    })
})

app.get('/api/v1/tours/:id', (req, res) => {
    console.log(req.params)

    const id = req.params.id * 1;
    const tour = tours.find((el) => { return el.id === id })

    if (!tour){
        return res.status(404).json({
            status: 'Fail',
            message: 'Invalid ID'
        })
    } else {

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    }
})

app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    })
})

app.patch('/api/v1/tours/:id', (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find((el) => { return el.id === id })

    if (!tour){
        return res.status(404).json({
            status: 'Fail',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated Tour here>'
        }
    })
})

app.delete('/api/v1/tours/:id', (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find((el) => { return el.id === id })

    if (!tour){
        return res.status(404).json({
            status: 'Fail',
            message: 'Invalid ID'
        })
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})

const port = 3000;

app.listen(port , () => {
    console.log(`Running on port ${port}....`)
});

