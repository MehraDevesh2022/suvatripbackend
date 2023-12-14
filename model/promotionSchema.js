// const Promotion = require("../models/Promotion");

// exports.createPromotion = async (req, res) => {
//   try {
//     const { promotionName, room_id, endDate } = req.body;

//     const newPromotion = new Promotion({
//       UUID: generateUUID(),
//       promotionName,
//       room_id,
//       endDate,
//       totalReservation: 0,
//       status: "Active",
//     });

//     const savedPromotion = await newPromotion.save();

//     res.status(201).json(savedPromotion);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.getAllPromotions = async (req, res) => {
//   try {
//     const promotions = await Promotion.find();
//     res.json(promotions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.getPromotionById = async (req, res) => {
//   try {
//     const promotion = await Promotion.findOne({ UUID: req.params.id });
//     if (!promotion) {
//       return res.status(404).json({ error: "Promotion not found" });
//     }
//     res.json(promotion);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.updatePromotion = async (req, res) => {
//   try {
//     const { promotionName, room_id, endDate, totalReservation, status } =
//       req.body;

//     const promotion = await Promotion.findOne({ UUID: req.params.id });
//     if (!promotion) {
//       return res.status(404).json({ error: "Promotion not found" });
//     }

//     promotion.promotionName = promotionName || promotion.promotionName;
//     promotion.room_id = room_id || promotion.room_id;
//     promotion.endDate = endDate || promotion.endDate;
//     promotion.totalReservation =
//       totalReservation !== undefined
//         ? totalReservation
//         : promotion.totalReservation;
//     promotion.status = status || promotion.status;

//     await promotion.save();

//     res.json({
//       status: true,
//       message: "Promotion data updated successfully",
//       data: promotion,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.deletePromotion = async (req, res) => {
//   try {
//     const promotion = await Promotion.findOneAndRemove({ UUID: req.params.id });
//     if (!promotion) {
//       return res.status(404).json({ error: "Promotion not found" });
//     }

//     res.json({ status: true, message: "Promotion deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Function to generate a UUID (replace with your preferred method)
// function generateUUID() {
//   // Implementation of UUID generation goes here
//   // Example: return someUUIDGenerationFunction();
// }
