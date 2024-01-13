const Review = require("../model/reviewSchema");
const Booking = require("../model/bookingSchema");
const User = require("../model/userSchema");
const Hotel = require("../model/hotelSchema");
const multerConfigs = require("../middleWare/multerConfig");
exports.getAllReviews = async (req, res) => {
  try {
    const { id } = req.params;
    let filter = { hotel_id: id }; // Filter reviews based on the provided hotel ID

    if (req.query.filter) {
      const filterType = req.query.filter;
      const today = new Date();
      let startDate = new Date();

      if (filterType === "last30days") {
        startDate.setDate(today.getDate() - 30);
      } else if (filterType === "3months") {
        startDate.setMonth(today.getMonth() - 3);
      } else if (filterType === "6months") {
        startDate.setMonth(today.getMonth() - 6);
      } else if (filterType === "12months") {
        startDate.setFullYear(today.getFullYear() - 1);
      }

      filter.created_at = { $gte: startDate, $lte: today };
    }

    const reviews = await Review.find(filter)
      .populate({
        path: "hotel_id",
        model: "Hotel",
        select: "name propertyName country propertyType",
      })
      .populate({
        path: "booking_id",
        model: "Booking",
        select: "checkIn checkOut room_id",
        populate: {
          path: "room_id",
          model: "Room",
          select: "roomType guests",
        },
      });

    console.log("Reviews:", reviews);

    if (reviews.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No reviews found for the specified hotel ID",
      });
    }

    const totalReviews = reviews.length;
    const ratingCounts = {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0,
    };
    const ratingPercentages = {};

    // Initialize sum variables for each rating category
    let sumStaffRating = 0;
    let sumFacilitiesRating = 0;
    let sumCleanlinessRating = 0;
    let sumComfortRating = 0;
    let sumMoneyRating = 0;
    let sumLocationRating = 0;
    let sumWifiRating = 0;

    for (const review of reviews) {
      if (review.booking_id) {
        review.bookingDetails = {
          checkIn: review.booking_id.checkIn,
          checkOut: review.booking_id.checkOut,
          roomDetails: {
            roomType: review.booking_id.room_id.roomType,
            guests: review.booking_id.room_id.guests,
          },
        };
      } else {
        review.bookingDetails = null;
      }

      // Update rating counts
      switch (review.rating) {
        case 1:
          ratingCounts["oneStar"] += 1;
          break;
        case 2:
          ratingCounts["twoStars"] += 1;
          break;
        case 3:
          ratingCounts["threeStars"] += 1;
          break;
        case 4:
          ratingCounts["fourStars"] += 1;
          break;
        case 5:
          ratingCounts["fiveStars"] += 1;
          break;
        default:
          break;
      }

      // Sum up ratings for average calculation
      sumStaffRating += review.staff_rating;
      sumFacilitiesRating += review.facilities_rating;
      sumCleanlinessRating += review.cleanliness_rating;
      sumComfortRating += review.comfort_rating;
      sumMoneyRating += review.money_rating;
      sumLocationRating += review.location_rating;
      sumWifiRating += review.wifi_rating;
    }

    // Calculate average ratings
    const avgStaffRating = sumStaffRating / totalReviews;
    const avgFacilitiesRating = sumFacilitiesRating / totalReviews;
    const avgCleanlinessRating = sumCleanlinessRating / totalReviews;
    const avgComfortRating = sumComfortRating / totalReviews;
    const avgMoneyRating = sumMoneyRating / totalReviews;
    const avgLocationRating = sumLocationRating / totalReviews;
    const avgWifiRating = sumWifiRating / totalReviews;

    // Update rating percentages
    for (const key in ratingCounts) {
      if (ratingCounts.hasOwnProperty(key)) {
        const count = ratingCounts[key];
        ratingPercentages[key] = (count / totalReviews) * 100;
      }
    }

    // Create an array for average ratings
    const averageRatings = [
      { category: "Staff", rating: avgStaffRating.toFixed(1) },
      { category: "Facilities", rating: avgFacilitiesRating.toFixed(1) },
      { category: "Cleanliness", rating: avgCleanlinessRating.toFixed(1) },
      { category: "Comfort", rating: avgComfortRating.toFixed(1) },
      { category: "Value for Money", rating: avgMoneyRating.toFixed(1) },
      { category: "Location", rating: avgLocationRating.toFixed(1) },
      { category: "Free Wifi", rating: avgWifiRating.toFixed(1) },
    ];

    // total average rating
    const totalAvgRating =
      (avgStaffRating +
        avgFacilitiesRating +
        avgCleanlinessRating +
        avgComfortRating +
        avgMoneyRating +
        avgLocationRating +
        avgWifiRating) /
      7;

    res.json({
      status: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        // ratingCounts,
        // ratingPercentages,
        averageRatings,
        totalAvgRating: totalAvgRating.toFixed(1),
      },
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

    const review = await Review.findOne({
      user_id: req.body.user_id,
      hotel_id: req.body.hotel_id,
    });

    if (review) {
      return res.status(201).json({
        success: false,
        message: "You have already reviewed this hotel",
      });
    }

    const booking = await Booking.findOne({
      hotel_id: req.body.hotel_id,
      user_id: req.body.user_id,
    });

    if (!booking) {
      return res.status(201).json({
        success: false,
        message: "You have not booked this hotel",
      });
    }

    // check if user has already reviewed the hotel

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

    const allowedFields = [
      "hotel_id",
      "user_id",
      "staff_rating",
      "facilities_rating",
      "cleanliness_rating",
      "comfort_rating",
      "money_rating",
      "location_rating",
      "wifi_rating",
      "review",
      "highlight",
      "username",
    ];

    const newReviewData = {};

    allowedFields.forEach((key) => {
      // for converting rating fields to numbers
      if (key.endsWith("_rating")) {
        newReviewData[key] = parseInt(req.body[key], 10);
        console.log("New Review Data:", key, newReviewData[key]);
      } else {
        newReviewData[key] = req.body[key];
      }
    });

    newReviewData.booking_id = booking._id;
    const newReview = await Review.create(newReviewData);
    console.log("New Review:", newReview);

    res.status(201).json({
      status: true,
      message: "Review created successfully",
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
    const review = await Review.findById(req.params.id).populate(
      "hotel_id user_id"
    );
    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found",
      });
    }
    res.json({
      status: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    console.log("Review:");
    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found",
      });
    }

    const allowedFields = [
      "hotel_id",
      "user_id",
      "staff_rating",
      "facilities_rating",
      "cleanliness_rating",
      "comfort_rating",
      "money_rating",
      "location_rating",
      "wifi_rating",
      "review",
      "highlight",
    ];

    allowedFields.forEach((key) => {
      if (key in req.body) {
        if (key.endsWith("_rating")) {
          review[key] = parseInt(req.body[key], 10);
        } else {
          review[key] = req.body[key];
        }
      }
    });

    const updatedReview = await review.save();

    res.json({
      status: true,
      message: "Review updated successfully",
      data: {
        updatedReview,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({
        status: false,
        message: "Review not found",
      });
    }
    res.json({
      status: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
