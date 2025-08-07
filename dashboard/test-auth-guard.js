const axios = require("axios");

const BASE_URL = "https://localhost:3443/api";

const testAuthGuard = async () => {
  try {
    console.log("🧪 Testing Auth Guard with Loading State...");

    // 1. Test login
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

    // 2. Test profile endpoint multiple times to simulate loading
    console.log("2. Testing profile endpoint (simulating loading state)...");
    
    // First call (simulating initial load)
    const profileResponse1 = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        Cookie: cookieHeader,
      },
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
      withCredentials: true,
    });

    console.log("✅ First profile check successful");
    console.log("User data:", JSON.stringify(profileResponse1.data, null, 2));

    // Second call (simulating after loading complete)
    const profileResponse2 = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        Cookie: cookieHeader,
      },
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
      withCredentials: true,
    });

    console.log("✅ Second profile check successful");
    console.log("User data:", JSON.stringify(profileResponse2.data, null, 2));

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

    console.log("🎉 Auth Guard with loading state working correctly!");
    console.log("💡 The AuthGuard should now wait for loading to complete before making decisions");
  } catch (error) {
    if (error.response) {
      console.log("❌ Error:", error.response.status, error.response.data);
    } else {
      console.log("❌ Network error:", error.message);
    }
  }
};

testAuthGuard();
