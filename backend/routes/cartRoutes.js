const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user's cart
 *     security: [{ cookieAuth: [] }]
 */
router.get("/", getCart);
/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add a flight to cart
 *     security: [{ cookieAuth: [] }]
 */
router.post("/items", addToCart);
/**
 * @openapi
 * /api/cart/items/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security: [{ cookieAuth: [] }]
 */
router.put("/items/:itemId", updateCartItem);
/**
 * @openapi
 * /api/cart/items/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from cart
 *     security: [{ cookieAuth: [] }]
 */
router.delete("/items/:itemId", removeCartItem);
/**
 * @openapi
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear cart
 *     security: [{ cookieAuth: [] }]
 */
router.delete("/", clearCart);

module.exports = router;
