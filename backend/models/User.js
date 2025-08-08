const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: function () {
				// Name is required for all users except managers (who will set it at first login)
				return !this.roles || !this.roles.includes("manager");
			},
			trim: true,
		},
		surname: {
			type: String,
			required: function () {
				// Surname is required for all users except managers (who will set it at first login)
				return !this.roles || !this.roles.includes("manager");
			},
			trim: true,
		},
		birthDate: {
			type: Date,
			required: function () {
				// Birth date is required for all users except managers (who will set it at first login)
				return !this.roles || !this.roles.includes("manager");
			},
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		roles: {
			type: [String],
			enum: ["customer", "employee", "manager", "admin"],
			default: ["customer"],
		},
		passwordMustChange: {
			type: Boolean,
			default: false,
		},
		invitedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		airlines: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Airline",
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
