const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { clientUrl } = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const path = require("path");

const app = express();

app.use(cors({
    origin: clientUrl,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/media", express.static(path.resolve(__dirname, "../../media")));

app.use(routes);

app.use(notFound);
app.use(errorHandler);

// Exported without listening so tests can drive it with supertest
module.exports = app;
