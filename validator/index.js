// creating userSignupValidator method
exports.userSignupValidator = (req, res, next) => {
  // from express-validator method .check etc
  req.check("name", "name is required").notEmpty();
  req
    .check("email", "email must be  between 3 and 32 char")
    .matches(/.+\@.+\..+/)
    .withMessage("email must contain @")
    .isLength({
      min: 4,
      max: 32
    });
  req.check("password", "password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("password must contain 6 characters")
    .matches(/\d/)
    .withMessage("password must contain a number");
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  next();
};
