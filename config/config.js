if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
module.exports = {
  mongodb: process.env.MONGODB_URI || "mongodb://localhost:27017/sample-db",
  port: process.env.PORT || 9001,
};
