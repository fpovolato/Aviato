const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order from request body or backend cart
 *     security: [{ cookieAuth: [] }]
 */
router.post("/", createOrder);
/**
 * @openapi
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user's orders
 *     security: [{ cookieAuth: [] }]
 */
router.get("/my", getUserOrders);
/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by id
 *     security: [{ cookieAuth: [] }]
 */
router.get("/:id", getOrderById);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List all orders (admin)
 *     security: [{ cookieAuth: [] }]
 */
router.get("/", adminOnly, getOrders);
/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security: [{ cookieAuth: [] }]
 */
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
