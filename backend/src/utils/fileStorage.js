const fs = require("fs");
const path = require("path");
const { UPLOADS_DIR } = require("../config/paths");
const { cloudinary } = require("../config/cloudinary");

const deleteLocalFile = (filename) => {
    if(!filename) return;
    fs.unlink(path.join(UPLOADS_DIR, filename), (err) => {
        if(err && err.code !== "ENOENT"){
            console.error("Local delete failed: ", err);
        }
    });
};


const CLOUDINARY_RESOURCE_TYPES = ["image", "video", "raw"];

const deleteCloudFile = async (publicId, resourceType = "image") => {
    if(!publicId) return;

    // Cloudinary's destroy API only accepts "image", "video", or "raw" - "auto"
    // (used at upload time to auto-detect the type, e.g. for certificates) is
    // not a valid resource_type here and always resolves to "not found". Try
    // the hinted type first, then fall back through the rest, since we don't
    // always know which one the file actually landed under.
    const typesToTry = resourceType === "auto"
        ? CLOUDINARY_RESOURCE_TYPES
        : [resourceType, ...CLOUDINARY_RESOURCE_TYPES.filter((type) => type !== resourceType)];

    try {
        for (const type of typesToTry) {
            const res = await cloudinary.uploader.destroy(publicId, { resource_type: type });
            if (res && res.result !== "not found") return;
        }
    } catch (err) {
        console.error("Cloud delete failed: ", err);
    }
};

const deleteEverywhere = async (filename, publicId, resourceType = "image") => {
    deleteLocalFile(filename);
    await deleteCloudFile(publicId, resourceType);
};

module.exports = { deleteLocalFile, deleteCloudFile, deleteEverywhere };

