const express = require("express");
const router = express.Router();
const {
  createPlane,
  getPlanes,
  getPlaneById,
  getPlaneByCode,
  getPlanesByAirline,
} = require("../controllers/planeController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, adminOnly, createPlane);
router.get("/", getPlanes);
router.get("/:id", getPlaneById);
router.get("/code/:code", getPlaneByCode);
router.get("/airline/:airlineId", getPlanesByAirline);

module.exports = router;
