const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

async function createEmployee() {
	try {
		console.log("👤 Creating employee user...\n");

		const employeeData = {
			name: "John",
			surname: "Wick",
			email: "john@wick.com",
			birthDate: "2000-04-01",
			password: "john123",
			roles: ["employee"],
			airlines: ["681b733939eb713122b5bbf0"], // Volare Airlines ID
		};

		const response = await axios.post(
			`${BASE_URL}/users/register`,
			employeeData,
			{
				httpsAgent: new (require("https").Agent)({
					rejectUnauthorized: false,
				}),
			}
		);

		console.log("✅ Employee created successfully!");
		console.log("User ID:", response.data._id);
		console.log("Email:", response.data.email);
		console.log("Roles:", response.data.roles);
		console.log("Airlines:", response.data.airlines);
	} catch (error) {
		if (
			error.response?.status === 400 &&
			error.response?.data?.message === "User already exists"
		) {
			console.log("ℹ️  Employee user already exists");
		} else {
			console.error(
				"❌ Error creating employee:",
				error.response?.data || error.message
			);
		}
	}
}

createEmployee();
