const wrapAsync = require("../utils/wrapAsync");
const { Signup, Login, CheckUser } = require("../controllers/AuthController");
const { userVerification } = require("../middleware/AuthMiddleware");
const router = require("express").Router();

router.post("/signup", wrapAsync(Signup));
router.post("/login", wrapAsync(Login));
router.post("/check-user", wrapAsync(CheckUser));
router.post("/", userVerification);

module.exports = router;