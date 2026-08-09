const fs = require("fs");
const path = require("path");
const { cloudinary } = require("../cloudConfig");

const deleteLocalFile = (filename) => {
    if(!filename) return;
    fs.unlink(path.join(__dirname, "../uploads", filename), (err) => {
        if(err && err.code !== "ENOENT"){
            console.error("Local delete failed: ", err);
        }
    });
};


const deleteCloudFile = async (publicId) => {
    if(!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloud delete failed: ", err);
    }
};

const deleteEverywhere = async (filename, publicId) => {
    deleteLocalFile(filename);
    await deleteCloudFile(publicId);
};

module.exports = { deleteLocalFile, deleteCloudFile, deleteEverywhere };

