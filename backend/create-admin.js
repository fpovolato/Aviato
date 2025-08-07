const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

async function createAdmin() {
	try {
		console.log("👤 Creating admin user...\n");

		const adminData = {
			name: "Admin",
			surname: "User",
			email: "admin@aviato.com",
			birthDate: "1990-01-01",
			password: "admin123",
			roles: ["admin"],
		};

		const response = await axios.post(`${BASE_URL}/users/register`, adminData, {
			httpsAgent: new (require("https").Agent)({
				rejectUnauthorized: false,
			}),
		});

		console.log("✅ Admin created successfully!");
		console.log("User ID:", response.data._id);
		console.log("Email:", response.data.email);
		console.log("Roles:", response.data.roles);
	} catch (error) {
		if (
			error.response?.status === 400 &&
			error.response?.data?.message === "User already exists"
		) {
			console.log("ℹ️  Admin user already exists");
		} else {
			console.error(
				"❌ Error creating admin:",
				error.response?.data || error.message
			);
		}
	}
}

createAdmin();
