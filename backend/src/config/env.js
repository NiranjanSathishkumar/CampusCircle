require("dotenv").config();

// Single place where process.env is read at boot. Secrets that tests override at
// runtime (JWT_SECRET, JWT_REFRESH_SECRET) are deliberately NOT cached here — they
// stay as call-time process.env reads in utils/signToken and utils/refreshAuth.
module.exports = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 8080,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    dbUrl: process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle",
    cloudinary: {
        cloudName: process.env.CLOUD_NAME,
        apiKey: process.env.CLOUD_API_KEY,
        apiSecret: process.env.CLOUD_API_SECRET,
    },
};
