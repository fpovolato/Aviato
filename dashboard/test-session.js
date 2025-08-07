const axios = require("axios");

const BASE_URL = "http://localhost:4200/api";

const testSession = async () => {
  try {
    console.log("🧪 Testing Session Persistence...");

    // 1. Test login through proxy
    console.log("1. Testing login through proxy...");
    const loginResponse = await axios.post(
      `${BASE_URL}/users/login`,
      {
        email: "admin@aviato.com",
        password: "admin123",
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Login successful");
    console.log("Response:", loginResponse.data);

    // 2. Test profile endpoint through proxy
    console.log("2. Testing profile endpoint through proxy...");
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Profile endpoint working");
    console.log("User data:", JSON.stringify(profileResponse.data, null, 2));

    // 3. Test analytics endpoint through proxy
    console.log("3. Testing analytics endpoint through proxy...");
    const analyticsResponse = await axios.get(
      `${BASE_URL}/analytics/dashboard`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Analytics endpoint working");
    console.log(
      "Analytics data:",
      JSON.stringify(analyticsResponse.data, null, 2)
    );

    console.log("🎉 Session persistence working correctly!");
  } catch (error) {
    if (error.response) {
      console.log("❌ Error:", error.response.status, error.response.data);
    } else {
      console.log("❌ Network error:", error.message);
    }
  }
};

testSession();
