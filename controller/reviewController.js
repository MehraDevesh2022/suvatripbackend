const Review = require("../model/reviewSchema");

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({
      status: true,
      message: "Review data fetched successfully",
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  const allowedFields = ["user_id", "hotel_id", "rating", "review_text"];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid fields in request!" });
  }

  try {
    const review = new Review(req.body);
    const newReview = await review.save();
    res.json({
      status: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    res.json({
      status: true,
      message: "Review data fetched successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  const allowedFields = ["user_id", "hotel_id", "rating", "review_text"];

  const receivedFields = Object.keys(req.body);
  const isValidOperation = receivedFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid fields in request!" });
  }

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();
    res.json({
      status: true,
      message: "Review data updated successfully",
      data: review,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    await review.remove();
    res.json({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
