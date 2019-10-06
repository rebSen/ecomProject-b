const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  // console.log("Create order", req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    // .populate("User", "_id name address") // U maj sinon ne fonctonne pas O.O ET COMMENT2 NECREE PAS DERREUR !!
    .populate("User", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      console.log(orders);
      res.json(orders);
    });
};
