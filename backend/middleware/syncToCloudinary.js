const fs = require("fs");
const { cloudinary } = require("../cloudConfig");

const syncToCloudinary = (folder) => {
    return async (req, res, next) => {
        const files = req.file ? [req.file] : req.files || [];
        if(files.length === 0) return next();

        try {
            await Promise.all(
                files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: `campuscircle/${folder}`,
                        resource_type: "image",
                    });
                    file.cloudinary = {
                        url: result.secure_url,
                        publicId: result.public_id,
                    };
                })
            );
            next();
        } catch (err) {
            files.forEach((f) => fs.unlink(f.path, () => {}));
            next(err);
        }
    };
};

module.exports = syncToCloudinary;