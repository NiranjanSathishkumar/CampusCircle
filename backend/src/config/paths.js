const path = require("path");

// Local disk staging area for multer before syncToCloudinary uploads the file.
// Single source of truth so middleware/upload and utils/fileStorage can't drift.
module.exports = {
    UPLOADS_DIR: path.join(__dirname, "../../uploads"),
};
