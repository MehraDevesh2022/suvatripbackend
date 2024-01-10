const Review = require("../model/reviewSchema");
const Booking = require("../model/bookingSchema");
const multerConfigs = require("../middleWare/multerConfig");
exports.getAllReviews = async (req, res) => {
  try {
    let filter = {}; 

    if (req.query.filter) {
      const filterType = req.query.filter;
      const { id } = req.params;

      const today = new Date();
      let startDate = new Date();

      if (filterType === 'last30days') {
        startDate.setDate(today.getDate() - 30);
      } else if (filterType === '3months') {
        startDate.setMonth(today.getMonth() - 3);
      } else if (filterType === '6months') {
        startDate.setMonth(today.getMonth() - 6);
      } else if (filterType === '12months') {
        startDate.setFullYear(today.getFullYear() - 1);
      }

      filter = {
        created_at: { $gte: startDate, $lte: today },
        hotel_id: id,
      };
    }

    const reviews = await Review.find(filter).populate('user_id', 'username');

    const totalReviews = reviews.length;
    const ratingCounts = {
      'oneStar': 0,
      'twoStars': 0,
      'threeStars': 0,
      'fourStars': 0,
      'fiveStars': 0,
    };
    const ratingPercentages = {};

    reviews.forEach((review) => {
      switch (review.rating) {
        case 1:
          ratingCounts['oneStar'] += 1;
          break;
        case 2:
          ratingCounts['twoStars'] += 1;
          break;
        case 3:
          ratingCounts['threeStars'] += 1;
          break;
        case 4:
          ratingCounts['fourStars'] += 1;
          break;
        case 5:
          ratingCounts['fiveStars'] += 1;
          break;
        default:
          break;
      }
    });

    for (const key in ratingCounts) {
      if (ratingCounts.hasOwnProperty(key)) {
        const count = ratingCounts[key];
        ratingPercentages[key] = (count / totalReviews) * 100;
      }
    }

    res.json({
      status: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
      ratingCounts,
      ratingPercentages,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};






exports.createReview = async (req, res) => {
  try {
    console.log("Request Files:", req.body);

// check if user has a booking for the hotel
    const booking = await Booking.findOne({ hotel_id: req.body.hotel_id, user_id: req.body.user_id });
    if (!booking) {
      return res.status(201).json({
        success: false,
        message: 'You have not booked this hotel',
      });
    }

  console.log("Booking:", booking);

    // Commented out image handling code
    // const uploadPictures = multerConfigs.uploadPicture;
    // uploadPictures(req, res, async function (err) {
    //   if (err) {
    //     return res.status(400).json({
    //       status: false,
    //       message: 'Error uploading files.',
    //     });
    //   }

    //   const imageLinks = req.files.map(file => ({
    //     link: `${process.env.HOST}:${process.env.PORT}/uploads/reviewPictures/${file.filename}`,
    //   }));

    //   newReviewData.images = imageLinks;

    const allowedFields = ['hotel_id', 'user_id', 'staff_rating', 'facilities_rating', 'cleanliness_rating', 'comfort_rating', 'money_rating', 'location_rating', 'wifi_rating', 'review'];

    const newReviewData = {};

  
    allowedFields.forEach(key => {
      // for converting rating fields to numbers
      if (key.endsWith('_rating')) {
        newReviewData[key] = parseInt(req.body[key], 10);
        console.log("New Review Data:", key, newReviewData[key]);
      } else {
        newReviewData[key] = req.body[key];
      }
    });


    // Create review without images
    const newReview = await Review.create(newReviewData);
    console.log("New Review:", newReview);

    res.status(201).json({
      status: true,
      message: 'Review created successfully',
      data: newReview,
    });
    // });
  } catch (err) {
    console.log("Error:", err);
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('hotel_id user_id');
    if (!review) {
      return res.status(404).json({
        status: false,
        message: 'Review not found'
      });
    }
    res.json({
      status: true,
      message: 'Review retrieved successfully',
      data: review
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        status: false,
        message: 'Review not found'
      });
    }

    const allowedFields = ['hotel_id', 'user_id', 'rating', 'review'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        review[key] = req.body[key];
      }
    });

    const updatedReview = await review.save();
    res.json({
      status: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({
        status: false,
        message: 'Review not found'
      });
    }
    res.json({
      status: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

