const express = require('express');
const tourControlers = require('./../controlers/tourControler')

const router = express.Router();

router.param('id', tourControlers.checkID)

router
    .route('/')
    .get(tourControlers.getAllTours)
    .post(tourControlers.checkBoady, tourControlers.createTour)

router
    .route('/:id')
    .get(tourControlers.getTour)
    .patch(tourControlers.updateTour)
    .delete(tourControlers.deleteTour)

module.exports = router;