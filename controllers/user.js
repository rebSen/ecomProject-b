const User = require("../models/user");
const { Order } = require("../models/order");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found"
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// exports.update = (req, res) => {
//   User.findOneAndUpdate(
//     { _id: req.profile._id },
//     { $set: req.body },
//     { new: true },
//     (err, user) => {
//       if (err) {
//         return res.status(400).json({
//           error: "You are not authorized to perform this action"
//         });
//       }
//       console.log(user);
//       user.hashed_password = undefined;
//       user.salt = undefined;
//       res.json(user);
//     }
//   );
// };
exports.update = (req, res, next) => {
  let user = req.profile;
  user = _.extend(user, req.body); // extend - mutate the source object
  user.updated = Date.now();
  user.save(err => {
    if (err) {
      return res.status(400).json({
        error: "You are not authorized to perform this action"
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json({ user });
  });
};

// METHODES DU COURS
// exports.update = (req, res) => {
//   User.findOneAndUpdate(
//     // { useFindAndModify: false },

//     { _id: req.profile._id },
//     { $set: req.body },
//     { new: true },

//     (err, user) => {
//       if (err) {
//         return res.status(400).json({
//           error: "You are not authorized to perform this action"
//         });
//       }
//       user.hashed_password = undefined;
//       user.salt = undefined;

//       res.json(user);
//     }
//   );
// };

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];
  req.body.order.products.forEach(item => {
    console.log(item);
    history.push({
      _id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount
    });
  });
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res
          .status(400)
          .json({ error: "Could not update user purchase" });
      }
      next();
    }
  );
};

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("User", "_id name") // add Umaj
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json(orders);
    });
};
