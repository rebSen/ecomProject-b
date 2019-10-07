const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("Product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      req.order = order;
      next();
    });
};
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
    .populate("User")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      // console.log(orders);
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      console.log("ICI", order);
      res.json(order);
    }
  );
};
