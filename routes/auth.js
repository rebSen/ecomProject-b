const express = require("express");
const router = express.Router();
const {
  sayHi,
  signup,
  signin,
  signout,
  requireSignin
} = require("../controllers/auth");

const { userSignupValidator } = require("../validator");

router.get("/", sayHi);
router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// router.get("/hello", requireSignin, (req, res) => {
//   res.send("hello theeeere");
// });

module.exports = router;
