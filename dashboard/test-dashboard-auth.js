const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

const testDashboardAuth = async () => {
  try {
    console.log("🧪 Testing Dashboard Authentication...");

    // 1. Test login directly to backend
    console.log("1. Testing login...");
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

    // Extract cookies
    const cookies = loginResponse.headers["set-cookie"];
    const cookieHeader = cookies ? cookies.join("; ") : "";

    console.log("✅ Login successful");

    // 2. Test profile endpoint
    console.log("2. Testing profile endpoint...");
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        Cookie: cookieHeader,
      },
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
      withCredentials: true,
    });

    console.log("✅ Profile endpoint working");
    console.log("User data:", JSON.stringify(profileResponse.data, null, 2));

    // 3. Test analytics endpoint
    console.log("3. Testing analytics endpoint...");
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      headers: {
        Cookie: cookieHeader,
      },
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
      withCredentials: true,
    });

    console.log("✅ Analytics endpoint working");
    console.log("Analytics data:", JSON.stringify(analyticsResponse.data, null, 2));

    console.log("🎉 Dashboard authentication working correctly!");
  } catch (error) {
    if (error.response) {
      console.log("❌ Error:", error.response.status, error.response.data);
    } else {
      console.log("❌ Network error:", error.message);
    }
  }
};

testDashboardAuth();
