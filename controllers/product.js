const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const Product = require("../models/product");

exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category") // do not work
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "product not found"
        });
      }
      req.product = product;
      next();
    });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "image could not be uploaded"
      });
    }

    // ckeck for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "all fields are required"
      });
    }

    let product = new Product(fields);
    // 1Kb = 1000
    //1mb = 1000000

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "image could not be be less than 1mb size"
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contenType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json({
      deletedProduct,
      message: "Product deleted successfully"
    });
  });
};

exports.update = (req, res) => {
  console.log(res);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "image could not be uploaded"
      });
    }

    // ckeck for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "all fields are required"
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "image could not be be less than 1mb size"
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contenType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(result);
    });
  });
};

// SELL and ARRIVAL
// flexible way to return the product
// by sell = /products?sortBy=sold&order=desc&limit=4
// by arrival = /products?sortBy=createdAt&order=desc&limit=4
// if no params are sent, then all products are returned

exports.list = (req, res) => {
  console.log(res);
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .select("-photo")
    .populate("Category") // C maj O.O
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "productS not found"
        });
      }
      res.send(products);
    });
};

// It will find the product besed on the request product catégorie
// other products that has the same catégory will be returned

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({ _id: { $ne: req.product }, category: req.product.category }) //$ne Not including - in mongodb
    .limit(limit)
    // .select("-photo")
    .populate("Category", "_id name")
    .exec((err, products) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "productS related not found"
        });
      }
      res.send(products);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "productS related not found"
      });
    }
    res.json(categories);
  }); // method mongo
};

// for react - all comments in lesson 42

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("Category") // C maj !
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found"
        });
      }
      res.json({
        size: data.length,
        data
      });
    });
};

// will work like a middle ware lesson 43
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contenType); // type de la photo jpg png etc
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assing search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };

    // assign category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product based on query object with to properties
    // search and category
    //console.log("HELLO?", query);

    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(products);
    }).select("-photo");
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map(item => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } }
      }
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product"
      });
    }
    next();
  });
};
