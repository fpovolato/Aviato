const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createOrder);
router.get("/my", getUserOrders);
router.get("/:id", getOrderById);

router.get("/", adminOnly, getOrders);
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
