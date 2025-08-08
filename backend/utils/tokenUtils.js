const jwt = require("jsonwebtoken");

// Token configuration
const TOKEN_CONFIG = {
	access: {
		secret: process.env.JWT_SECRET,
		expiresIn: "1h",
	},
	refresh: {
		secret: process.env.JWT_SECRET, // Using same secret for now, can be changed to JWT_REFRESH_SECRET later
		expiresIn: "7d",
	},
};

/**
 * Generate access token for user authentication
 * @param {string} userId - User ID
 * @returns {string} JWT access token
 */
function generateAccessToken(userId) {
	return jwt.sign({ id: userId }, TOKEN_CONFIG.access.secret, {
		expiresIn: TOKEN_CONFIG.access.expiresIn,
	});
}

/**
 * Generate refresh token for token renewal
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(userId) {
	return jwt.sign({ id: userId }, TOKEN_CONFIG.refresh.secret, {
		expiresIn: TOKEN_CONFIG.refresh.expiresIn,
	});
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 */
function verifyAccessToken(token) {
	return jwt.verify(token, TOKEN_CONFIG.access.secret);
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 */
function verifyRefreshToken(token) {
	return jwt.verify(token, TOKEN_CONFIG.refresh.secret);
}

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID
 * @returns {object} Object containing access and refresh tokens
 */
function generateTokenPair(userId) {
	return {
		accessToken: generateAccessToken(userId),
		refreshToken: generateRefreshToken(userId),
	};
}

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	generateTokenPair,
	TOKEN_CONFIG,
};
