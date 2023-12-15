const Review = require("../model/reviewSchema");

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('hotel_id user_id');
    res.json({
      status: true,
      message: 'All reviews retrieved successfully',
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const allowedFields = ['hotel_id', 'user_id', 'rating', 'review'];

    const newReviewData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        newReviewData[key] = req.body[key];
      }
    });

    const newReview = await Review.create(newReviewData);
    res.status(201).json({
      status: true,
      message: 'Review created successfully',
      data: newReview
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
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
