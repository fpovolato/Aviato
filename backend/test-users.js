const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

// Test delle funzionalità di gestione utenti
async function testUserManagement() {
	try {
		console.log("🧪 Testing User Management System...\n");

		// 1. Login come admin
		console.log("1. Logging in as admin...");
		const loginResponse = await axios.post(
			`${BASE_URL}/users/login`,
			{
				email: "admin@aviato.com",
				password: "admin123",
			},
			{
				httpsAgent: new (require("https").Agent)({
					rejectUnauthorized: false,
				}),
				withCredentials: true,
			}
		);

		// Estrai i cookie dalla risposta
		const cookies = loginResponse.headers["set-cookie"];
		const cookieHeader = cookies ? cookies.join("; ") : "";

		console.log("✅ Admin login successful\n");

		// 2. Ottenere tutti gli utenti
		console.log("2. Fetching all users...");
		const usersResponse = await axios.get(`${BASE_URL}/users`, {
			headers: {
				Cookie: cookieHeader,
			},
			httpsAgent: new (require("https").Agent)({
				rejectUnauthorized: false,
			}),
			withCredentials: true,
		});
		console.log(`✅ Found ${usersResponse.data.length} users\n`);

		// 3. Ottenere tutte le compagnie aeree
		console.log("3. Fetching all airlines...");
		const airlinesResponse = await axios.get(`${BASE_URL}/airlines`, {
			httpsAgent: new (require("https").Agent)({
				rejectUnauthorized: false,
			}),
		});
		console.log(`✅ Found ${airlinesResponse.data.length} airlines\n`);

		// 4. Testare la promozione di un utente a employee
		if (usersResponse.data.length > 0 && airlinesResponse.data.length > 0) {
			const testUser = usersResponse.data.find((u) =>
				u.roles.includes("customer")
			);
			const testAirline = airlinesResponse.data[0];

			if (testUser) {
				console.log(
					`4. Testing employee promotion for user: ${testUser.name} ${testUser.surname}`
				);

				const promotionResponse = await axios.patch(
					`${BASE_URL}/users/${testUser._id}/airline-role`,
					{
						airlineId: testAirline._id,
						role: "employee",
					},
					{
						headers: {
							Cookie: cookieHeader,
						},
						httpsAgent: new (require("https").Agent)({
							rejectUnauthorized: false,
						}),
						withCredentials: true,
					}
				);

				console.log(
					`✅ User promoted to employee with airline: ${testAirline.name}\n`
				);
			}
		}

		// 5. Testare la promozione di un employee a admin
		const employeeUser = usersResponse.data.find((u) =>
			u.roles.includes("employee")
		);
		if (employeeUser) {
			console.log(
				`5. Testing admin promotion for employee: ${employeeUser.name} ${employeeUser.surname}`
			);

			const adminPromotionResponse = await axios.patch(
				`${BASE_URL}/users/${employeeUser._id}/role`,
				{ role: "admin" },
				{
					headers: {
						Cookie: cookieHeader,
					},
					httpsAgent: new (require("https").Agent)({
						rejectUnauthorized: false,
					}),
					withCredentials: true,
				}
			);

			console.log("✅ Employee promoted to admin\n");
		}

		console.log("🎉 All tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error.response?.data || error.message);
	}
}

// Esegui i test
testUserManagement();
