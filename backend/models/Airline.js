const mongoose = require("mongoose");

const airlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

airlineSchema.virtual("employees", {
  ref: "User",
  localField: "_id",
  foreignField: "airline",
  match: { roles: "employee" },
});

module.exports = mongoose.model("Airline", airlineSchema);
