const fs = require("fs");
const { cloudinary } = require("../config/cloudinary");

// Local disk is only a staging area for multer. Cloudinary is the system of
// record and uploads/ is never served, so the local copy is discarded either
// way — after a successful upload it is redundant, after a failure it is junk.
const discardLocal = (files) => files.forEach((f) => fs.unlink(f.path, () => {}));

const syncToCloudinary = (folder, resourceType = "image") => {
    return async (req, res, next) => {
        const files = req.file ? [req.file] : req.files || [];
        if(files.length === 0) return next();

        try {
            await Promise.all(
                files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: `campuscircle/${folder}`,
                        resource_type: resourceType,
                    });
                    file.cloudinary = {
                        url: result.secure_url,
                        publicId: result.public_id,
                    };
                })
            );
            discardLocal(files);
            next();
        } catch (err) {
            discardLocal(files);
            next(err);
        }
    };
};

module.exports = syncToCloudinary;
