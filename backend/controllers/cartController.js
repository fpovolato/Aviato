const Cart = require("../models/Cart");
const Flight = require("../models/Flight");

/**
 * @openapi
 * tags: [Cart]
 * summary: Get current user's cart
 * security: [{ cookieAuth: [] }]
 */
const getCart = async (req, res) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.flight",
    select: "flightNumber departureDate arrivalDate price",
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  const obj = cart.toObject({ virtuals: true });
  res.json(obj);
};

/**
 * @openapi
 * tags: [Cart]
 * summary: Add flight to cart
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [flightId]
 *         properties:
 *           flightId: { type: string }
 *           quantity: { type: integer, minimum: 1 }
 */
const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { flightId, quantity = 1 } = req.body;

  const flight = await Flight.findById(flightId);
  if (!flight) {
    return res.status(404).json({ message: "Flight not found" });
  }
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  const existing = cart.items.find((i) => i.flight.toString() === flightId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      flight: flightId,
      quantity,
      priceAtAdd: flight.price,
    });
  }
  await cart.save();
  res.json(
    await cart.populate(
      "items.flight",
      "flightNumber departureDate arrivalDate price"
    )
  );
};

/**
 * @openapi
 * tags: [Cart]
 * summary: Update cart item quantity
 * security: [{ cookieAuth: [] }]
 */
const updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
};

/**
 * @openapi
 * tags: [Cart]
 * summary: Remove item from cart
 * security: [{ cookieAuth: [] }]
 */
const removeCartItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items.id(itemId).remove();
  await cart.save();
  res.json(cart);
};

/**
 * @openapi
 * tags: [Cart]
 * summary: Clear cart
 * security: [{ cookieAuth: [] }]
 */
const clearCart = async (req, res) => {
  const userId = req.user._id;
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });
  res.json({ message: "Cart cleared" });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
