const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { User, DEFAULT_PROFILE_PICTURE, DEFAULT_PROFILE_BANNER } = require("../models/User");
const Community = require("../models/Community");
const Admin = require("../models/Admin");
const { cloudinary } = require("../cloudConfig");
const studentController = require("../controllers/StudentController");

// Helper to create mock response object
function createMockRes() {
    const res = {};
    res.statusCode = 200;
    res.jsonData = null;
    res.status = function (code) {
        res.statusCode = code;
        return res;
    };
    res.json = function (data) {
        res.jsonData = data;
        return res;
    };
    return res;
}

describe("StudentController Unit Tests", () => {
    let originalFindOne;
    let originalCommunityFindOne;
    let originalAdminFindOne;
    let originalUnlink;
    let originalDestroy;
    let deletedLocalFiles = [];
    let deletedCloudIds = [];

    beforeEach(() => {
        originalFindOne = User.findOne;
        originalCommunityFindOne = Community.findOne;
        originalAdminFindOne = Admin.findOne;
        originalUnlink = fs.unlink;
        originalDestroy = cloudinary.uploader.destroy;

        Community.findOne = async () => null;
        Admin.findOne = async () => null;

        deletedLocalFiles = [];
        deletedCloudIds = [];

        fs.unlink = (filePath, cb) => {
            deletedLocalFiles.push(path.basename(filePath));
            if (cb) cb(null);
        };

        cloudinary.uploader.destroy = async (publicId) => {
            deletedCloudIds.push(publicId);
            return { result: "ok" };
        };
    });

    afterEach(() => {
        User.findOne = originalFindOne;
        Community.findOne = originalCommunityFindOne;
        Admin.findOne = originalAdminFindOne;
        fs.unlink = originalUnlink;
        cloudinary.uploader.destroy = originalDestroy;
    });

    describe("getUserProfile", () => {
        it("should return 200 with success status and user object", async () => {
            const req = {
                user: {
                    _id: "user123",
                    name: "John Doe",
                    email: "john@example.com"
                }
            };
            const res = createMockRes();

            await studentController.getUserProfile(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.success, true);
            assert.deepStrictEqual(res.jsonData.user, req.user);
        });
    });

    describe("uploadProfilePicture", () => {
        it("should return 400 if req.file is missing", async () => {
            const req = { user: { profilePicture: { filename: DEFAULT_PROFILE_PICTURE } } };
            const res = createMockRes();

            await studentController.uploadProfilePicture(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.jsonData.message, "No image uploaded");
        });

        it("should update profile picture when valid file is provided", async () => {
            const user = {
                profilePicture: { filename: DEFAULT_PROFILE_PICTURE },
                save: async function () { this.saved = true; }
            };
            const req = {
                user,
                file: {
                    filename: "avatar-123.jpg",
                    cloudinary: {
                        url: "https://cloudinary.com/avatar-123.jpg",
                        publicId: "avatar-123"
                    }
                }
            };
            const res = createMockRes();

            await studentController.uploadProfilePicture(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.message, "Profile Picture Updated");
            assert.strictEqual(user.profilePicture.filename, "avatar-123.jpg");
            assert.strictEqual(user.profilePicture.cloudinaryUrl, "https://cloudinary.com/avatar-123.jpg");
            assert.strictEqual(user.profilePicture.cloudinaryId, "avatar-123");
            assert.strictEqual(user.saved, true);
            assert.strictEqual(deletedLocalFiles.length, 0, "Should not delete default picture locally");
            assert.strictEqual(deletedCloudIds.length, 0, "Should not delete default picture from cloud");
        });

        it("should delete previous picture if replacing custom profile picture", async () => {
            const user = {
                profilePicture: { filename: "old-avatar.jpg", cloudinaryId: "old-cid" },
                save: async function () { this.saved = true; }
            };
            const req = {
                user,
                file: {
                    filename: "new-avatar.jpg",
                    cloudinary: {
                        url: "https://cloudinary.com/new-avatar.jpg",
                        publicId: "new-cid"
                    }
                }
            };
            const res = createMockRes();

            await studentController.uploadProfilePicture(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(deletedLocalFiles.length, 1);
            assert.strictEqual(deletedLocalFiles[0], "old-avatar.jpg");
            assert.strictEqual(deletedCloudIds.length, 1);
            assert.strictEqual(deletedCloudIds[0], "old-cid");
            assert.strictEqual(user.profilePicture.filename, "new-avatar.jpg");
        });
    });

    describe("uploadProfileBanner", () => {
        it("should return 400 if req.file is missing", async () => {
            const req = { user: { profileBanner: { filename: DEFAULT_PROFILE_BANNER } } };
            const res = createMockRes();

            await studentController.uploadProfileBanner(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.jsonData.message, "No image uploaded");
        });

        it("should update profile banner when valid file is provided", async () => {
            const user = {
                profileBanner: { filename: DEFAULT_PROFILE_BANNER },
                save: async function () { this.saved = true; }
            };
            const req = {
                user,
                file: {
                    filename: "banner-123.jpg",
                    cloudinary: {
                        url: "https://cloudinary.com/banner-123.jpg",
                        publicId: "banner-123"
                    }
                }
            };
            const res = createMockRes();

            await studentController.uploadProfileBanner(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.message, "Profile Banner Updated");
            assert.strictEqual(user.profileBanner.filename, "banner-123.jpg");
            assert.strictEqual(user.profileBanner.cloudinaryUrl, "https://cloudinary.com/banner-123.jpg");
            assert.strictEqual(user.profileBanner.cloudinaryId, "banner-123");
            assert.strictEqual(user.saved, true);
        });

        it("should delete previous banner if replacing custom banner", async () => {
            const user = {
                profileBanner: { filename: "old-banner.jpg", cloudinaryId: "old-cid" },
                save: async function () { this.saved = true; }
            };
            const req = {
                user,
                file: {
                    filename: "new-banner.jpg",
                    cloudinary: {
                        url: "https://cloudinary.com/new-banner.jpg",
                        publicId: "new-cid"
                    }
                }
            };
            const res = createMockRes();

            await studentController.uploadProfileBanner(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(deletedLocalFiles.length, 1);
            assert.strictEqual(deletedLocalFiles[0], "old-banner.jpg");
            assert.strictEqual(deletedCloudIds.length, 1);
            assert.strictEqual(deletedCloudIds[0], "old-cid");
            assert.strictEqual(user.profileBanner.filename, "new-banner.jpg");
        });
    });

    describe("updateUserProfile", () => {
        it("should return 400 if updated email, rollNo, or prnNo conflicts with another user", async () => {
            User.find = async () => [{ _id: "507f1f77bcf86cd799439022", email: "taken@example.com" }];

            const user = {
                _id: "507f1f77bcf86cd799439011",
                email: "current@example.com",
                rollNo: "R001",
                prnNo: "P001"
            };
            const req = {
                user,
                body: { email: "taken@example.com" }
            };
            const res = createMockRes();

            await studentController.updateUserProfile(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.match(res.jsonData.message, /already in use by another user/);
        });

        it("should successfully update allowed fields and format email, rollNo, and prnNo", async () => {
            User.find = async () => [];

            const user = {
                _id: "507f1f77bcf86cd799439011",
                name: "Old Name",
                email: "current@example.com",
                rollNo: "R001",
                prnNo: "P001",
                save: async function () { this.saved = true; }
            };
            const req = {
                user,
                body: {
                    name: "New Name",
                    email: " NEWEMAIL@EXAMPLE.COM ",
                    rollNo: " r002 ",
                    prnNo: " p002 ",
                    bio: "Updated bio text",
                    skills: ["JavaScript", "Node.js"],
                    unallowedField: "should_be_ignored"
                }
            };
            const res = createMockRes();

            await studentController.updateUserProfile(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.message, "User Profile Updated Successfully");
            assert.strictEqual(user.name, "New Name");
            assert.strictEqual(user.email, "newemail@example.com");
            assert.strictEqual(user.rollNo, "R002");
            assert.strictEqual(user.prnNo, "P002");
            assert.strictEqual(user.bio, "Updated bio text");
            assert.deepStrictEqual(user.skills, ["JavaScript", "Node.js"]);
            assert.strictEqual(user.unallowedField, undefined);
            assert.strictEqual(user.saved, true);
        });
    });

    describe("removeProfilePicture", () => {
        it("should return 400 if user has default profile picture", async () => {
            const req = { user: { profilePicture: { filename: DEFAULT_PROFILE_PICTURE } } };
            const res = createMockRes();

            await studentController.removeProfilePicture(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.jsonData.message, "No profile picture to remove");
        });

        it("should delete profile picture and reset to default if custom picture exists", async () => {
            const user = {
                profilePicture: { filename: "custom-pic.jpg", cloudinaryId: "cid-pic" },
                save: async function () { this.saved = true; }
            };
            const req = { user };
            const res = createMockRes();

            await studentController.removeProfilePicture(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.message, "Profile Picture Removed");
            assert.strictEqual(deletedLocalFiles.length, 1);
            assert.strictEqual(deletedLocalFiles[0], "custom-pic.jpg");
            assert.strictEqual(deletedCloudIds.length, 1);
            assert.strictEqual(deletedCloudIds[0], "cid-pic");
            assert.strictEqual(user.profilePicture.filename, DEFAULT_PROFILE_PICTURE);
            assert.strictEqual(user.saved, true);
        });
    });

    describe("removeProfileBanner", () => {
        it("should return 400 if user has default profile banner", async () => {
            const req = { user: { profileBanner: { filename: DEFAULT_PROFILE_BANNER } } };
            const res = createMockRes();

            await studentController.removeProfileBanner(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.jsonData.message, "No profile banner to remove");
        });

        it("should delete profile banner and reset to default if custom banner exists", async () => {
            const user = {
                profileBanner: { filename: "custom-banner.jpg", cloudinaryId: "cid-banner" },
                save: async function () { this.saved = true; }
            };
            const req = { user };
            const res = createMockRes();

            await studentController.removeProfileBanner(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.jsonData.message, "Profile Banner Removed");
            assert.strictEqual(deletedLocalFiles.length, 1);
            assert.strictEqual(deletedLocalFiles[0], "custom-banner.jpg");
            assert.strictEqual(deletedCloudIds.length, 1);
            assert.strictEqual(deletedCloudIds[0], "cid-banner");
            assert.strictEqual(user.profileBanner.filename, DEFAULT_PROFILE_BANNER);
            assert.strictEqual(user.saved, true);
        });
    });
});
