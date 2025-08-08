const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aviato")
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Import User model
const User = require("./models/User");

async function checkManagerRole() {
	try {
		// Find all users with manager role
		const managers = await User.find({ roles: { $in: ["manager"] } });

		console.log("\n=== Manager Users ===");
		managers.forEach((manager) => {
			console.log(`ID: ${manager._id}`);
			console.log(`Name: ${manager.name} ${manager.surname}`);
			console.log(`Email: ${manager.email}`);
			console.log(`Roles: ${manager.roles.join(", ")}`);
			console.log(
				`Airlines: ${manager.airlines.map((a) => a.toString()).join(", ")}`
			);
			console.log(`Password Must Change: ${manager.passwordMustChange}`);
			console.log("---");
		});

		// Find all users
		const allUsers = await User.find({});
		console.log("\n=== All Users ===");
		allUsers.forEach((user) => {
			console.log(`Email: ${user.email}, Roles: ${user.roles.join(", ")}`);
		});
	} catch (error) {
		console.error("Error:", error);
	} finally {
		mongoose.connection.close();
	}
}

checkManagerRole();
