const User = require("../models/user");
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

// 'create the method sayHi'
exports.sayHi = (req, res) => {
  res.json({ message: "hey you !" });
};

/// Problême !! pas de check si le user existe déja !!
exports.signup = (req, res) => {
  // console.log("req.body", req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user
    });
  });
};

// EUH route qui buggue.. inventée pour tchker si user existe deja..
// exports.signup = async (req, res) => {
//   // console.log("req body", req.body);
//   let userExist = await User.findOne({ email: req.body.email });
//   if (!userExist) {
//     const user = new User(req.body);
//     await user.save((err, user) => {
//       if (err) {
//         return res.status(400).json({ err: errorHandler(err) });
//       }
//       // pour retirer salt et le pass_hash de la résponse
//       user.salt = undefined;
//       user.hashed_password = undefined;
//       //response
//       res.json({ user });
//     });
//   } else {
//     //return res.status(400).json({ err: errorHandler(err) });
//     return res.status(400).json("That user ('s email) already exist!");
//   }
// };

exports.signin = (req, res) => {
  // find user based on email
  console.log(req.body);
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ err: "email does not exist. Please signup" });
    }
    // if user is founded make sure teh email and pssw match
    // create autheticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "email and password dont match"
      });
    }
    //generate signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persits the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return resopnse with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "signout ok !" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  // if user return true or not
  if (!user) {
    return res.status(403).json({
      error: "ACCESS DENIIIIEED you are not authentificated"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  // 0 is not admin
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin ressources ! Access denied"
    });
  }
  next();
};
