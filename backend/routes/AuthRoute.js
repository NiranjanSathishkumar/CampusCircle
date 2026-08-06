const wrapAsync = require("../utils/wrapAsync");
const { Signup, Login, CheckUser } = require("../controllers/AuthController");
const { userVerification } = require("../middleware/AuthMiddleware");
const router = require("express").Router();

router.post("/api/signup", wrapAsync(Signup));
router.post("/api/login", wrapAsync(Login));

module.exports = router;