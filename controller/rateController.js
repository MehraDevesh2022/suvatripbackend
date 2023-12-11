const RatePlan = require("../model/ratePlanSehma");

exports.createRatePlan = async (req, res) => {
  try {
    const { hotel_id, planName, discount, policy } = req.body;

    const newRatePlan = new RatePlan({
      hotel_id,
      planName,
      discount,
      policy,
    });

    const savedRatePlan = await newRatePlan.save();

    res.status(201).json(savedRatePlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllRatePlans = async (req, res) => {
  try {
    const ratePlans = await RatePlan.find();
    res.json(ratePlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRatePlanById = async (req, res) => {
  try {
    const ratePlan = await RatePlan.findOne({ _id: req.params.id });
    if (!ratePlan) {
      return res.status(404).json({ error: "Rate Plan not found" });
    }
    res.json(ratePlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateRatePlan = async (req, res) => {
  try {
    const { hotel_id, planName, discount, policy } = req.body;

    const ratePlan = await RatePlan.findOne({ _id: req.params.id });
    if (!ratePlan) {
      return res.status(404).json({ error: "Rate Plan not found" });
    }

    ratePlan.hotel_id = hotel_id || ratePlan.hotel_id;
    ratePlan.planName = planName || ratePlan.planName;
    ratePlan.discount = discount !== undefined ? discount : ratePlan.discount;
    ratePlan.policy = policy || ratePlan.policy;

    await ratePlan.save();

    res.json({
      status: true,
      message: "Rate Plan data updated successfully",
      data: ratePlan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRatePlan = async (req, res) => {
  try {
    const ratePlan = await RatePlan.findOneAndRemove({ _id: req.params.id });
    if (!ratePlan) {
      return res.status(404).json({ error: "Rate Plan not found" });
    }

    res.json({ status: true, message: "Rate Plan deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
