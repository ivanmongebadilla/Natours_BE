const express = require('express');
const tourControlers = require('./../controlers/tourControler')

const router = express.Router();

// router.param('id', tourControlers.checkID)
router.route('/top-5-cheap').get(tourControlers.aliasTopTours, tourControlers.getAllTours)

router.route('/tour-stats').get(tourControlers.getTourStats);

router.route('/monthly-plan/:year').get(tourControlers.getMonthlyPlan);

router
    .route('/')
    .get(tourControlers.getAllTours)
    .post(tourControlers.createTour)

router
    .route('/:id')
    .get(tourControlers.getTour)
    .patch(tourControlers.updateTour)
    .delete(tourControlers.deleteTour)

module.exports = router;