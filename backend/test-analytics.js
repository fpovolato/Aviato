const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

const testAnalytics = async () => {
	try {
		console.log("🧪 Testing Analytics Endpoint...");

		// 1. Test with admin user
		console.log("1. Testing with admin user...");
		const adminLoginResponse = await axios.post(
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

		const adminCookies = adminLoginResponse.headers["set-cookie"];
		const adminCookieHeader = adminCookies ? adminCookies.join("; ") : "";

		console.log("✅ Admin login successful");

		// Test admin analytics
		const adminAnalyticsResponse = await axios.get(
			`${BASE_URL}/analytics/dashboard`,
			{
				headers: {
					Cookie: adminCookieHeader,
				},
				httpsAgent: new (require("https").Agent)({
					rejectUnauthorized: false,
				}),
				withCredentials: true,
			}
		);

		console.log("✅ Admin analytics response:");
		console.log(JSON.stringify(adminAnalyticsResponse.data, null, 2));

		// 2. Test with employee user
		console.log("\n2. Testing with employee user...");
		const employeeLoginResponse = await axios.post(
			`${BASE_URL}/users/login`,
			{
				email: "john@wick.com",
				password: "john123",
			},
			{
				httpsAgent: new (require("https").Agent)({
					rejectUnauthorized: false,
				}),
				withCredentials: true,
			}
		);

		const employeeCookies = employeeLoginResponse.headers["set-cookie"];
		const employeeCookieHeader = employeeCookies
			? employeeCookies.join("; ")
			: "";

		console.log("✅ Employee login successful");

		// Test employee analytics
		const employeeAnalyticsResponse = await axios.get(
			`${BASE_URL}/analytics/dashboard`,
			{
				headers: {
					Cookie: employeeCookieHeader,
				},
				httpsAgent: new (require("https").Agent)({
					rejectUnauthorized: false,
				}),
				withCredentials: true,
			}
		);

		console.log("✅ Employee analytics response:");
		console.log(JSON.stringify(employeeAnalyticsResponse.data, null, 2));

		console.log("🎉 All analytics tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error.response?.data || error.message);
	}
};

testAnalytics();
