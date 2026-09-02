const multer = require("multer");
const ExpressError = require("../utils/ExpressError");

// Catch-all for undefined endpoints; hands off to the error handler below
const notFound = (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
};

// Centralized Express error handler, reads statusCode/message off ExpressError
const errorHandler = (err, req, res, next) => {
    // Multer throws plain MulterError instances (file too large, too many
    // files, unexpected field, ...) with no statusCode of its own — without
    // this they'd fall through to the generic 500 below instead of a 400
    // that actually tells the client what was wrong with their upload.
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
    }

    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = { notFound, errorHandler };
