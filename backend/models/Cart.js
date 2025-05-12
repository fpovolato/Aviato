const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    red: "Flight",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtAdd: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((sum, it) => sum + it.quantity * it.priceAtAdd, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
