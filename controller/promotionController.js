const Promotion = require("../model/promotionSchema");

exports.createPromotion = async (req, res) => {
  try {
    const allowedFields = ['promotionName', 'room_id', 'endDate', 'totalReservations', 'status'];

    const newPromotionData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        newPromotionData[key] = req.body[key];
      }
    });

    const newPromotion = await Promotion.create(newPromotionData);
    res.status(201).json({
      status: true,
      message: 'Promotion created successfully',
      data: newPromotion
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({hotel_id: req.params.id}).populate('room_id');
    res.json({
      status: true,
      message: 'All promotions retrieved successfully',
      data: promotions
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        status: false,
        message: 'Promotion not found'
      });
    }

    const allowedFields = ['promotionName', 'room_id', 'endDate', 'totalReservations', 'status'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        promotion[key] = req.body[key];
      }
    });

    const updatedPromotion = await promotion.save();
    res.json({
      status: true,
      message: 'Promotion updated successfully',
      data: updatedPromotion
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const deletedPromotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!deletedPromotion) {
      return res.status(404).json({
        status: false,
        message: 'Promotion not found'
      });
    }
    res.json({
      status: true,
      message: 'Promotion deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

