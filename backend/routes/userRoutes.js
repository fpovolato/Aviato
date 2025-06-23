const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserAirlineAndRole,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logoutUser);

router.get("/profile", protect, getProfile);

// Admin-only user management
router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);
router.patch("/:id/role", protect, adminOnly, updateUserRole);
router.patch("/:id/airline-role", protect, adminOnly, updateUserAirlineAndRole);

module.exports = router;
