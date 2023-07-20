const express = require("express");
const router = express.Router();
// utils
const JwtUtil = require("../utils/JwtUtil");
// daos
const AdminDAO = require("../models/AdminDAO");
const CategoryDAO = require("../models/CategoryDAO");
const ProductDAO = require("../models/ProductDAO");
const OrderDAO = require("../models/OrderDAO");
const CustomerDAO = require('../models/CustomerDAO');
const EmailUtil = require('../utils/EmailUtil');

// login
router.post("/login", async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      const admin = await AdminDAO.selectByUsernameAndPassword(
        username,
        password
      );
      if (admin) {
        const token = JwtUtil.genToken();
        res.json({
          success: true,
          message: "Authentication successful",
          token: token,
        });
      } else {
        res.status(200).json({ success: false, message: "Tên tài khoảng hoặc mật khẩu không đúng" });
      }
    } else {
      res.status(200).json({ success: false, message: "Vui lòng nhập tài khoảng và mật khẩu" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e });

  }

  module.exports = router;


});
router.get("/token", JwtUtil.checkToken, function (req, res) {
  try {
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    res.status(200).json({ success: true, message: "Token hợp lệ", token: token });
  } catch (e) {
    res.status(200).json({ success: false, message: e });

  }

});

// category
router.get("/categories", JwtUtil.checkToken, async function (req, res) {
  try {
    const categories = await CategoryDAO.selectAll();
    if(categories.length > 0){
      res.status(200).json({success:true,data:categories});
    }else{
      res.status(200).json({success:false,data:categories,message:"Hiện không có dữ liệu"});
    }
  } catch (e) {
    res.status(500).json({success:false,error:e});

  }
});
router.post("/categories", JwtUtil.checkToken, async function (req, res) {
  try {

    const name = req.body.name;
    const image = req.body.image;
    if (name && image) {
      const lengthOfCates = await CategoryDAO.countAll();
      const increNumber = lengthOfCates+1
      const d = new Date();
      let ms = d.getMilliseconds();
      const ID = 'CAT'+ms+ increNumber.toString().padStart(4, "0")
      const category = {ID, name,image};
      const data = await CategoryDAO.insert(category);
      res.status(200).json({data,success:true,message:"Thêm thành công"});
    } else {
      res.status(200).json({success:false,message:"Vui lòng nhập đủ trường dữ liệu"});
    }
  } catch (e) {
    res.status(500).json({success:false,e});
  }

});
router.put("/categories/:id", JwtUtil.checkToken, async function (req, res) {
  try {

    const _id = req.params.id;
    const name = req.body.name;
    const image = req.body.image;
    const id = req.body.id;
    const category = { _id, name: name ,image,id};
    if (_id && name && image && id){

      const data = await CategoryDAO.update(category);
      res.status(200).json({success:true,data,message:"Sửa thành công"});
    }else{
      res.status(200).json({success:false,data,message:"Nhập thiếu trường dữ liệu"});

    }

  } catch (e) {
    res.status(500).json({success:false,e});

  }
});
router.delete("/categories/:id", JwtUtil.checkToken, async function (req, res) {
  try {

    const _id = req.params.id;
    if(_id){
      const data = await CategoryDAO.delete(_id);
      res.status(200).json({data,success:true,message:"xoá thành công"});
    }else{
      res.status(200).json({success:false,message:"vui lòng chọn đối tượng để xoá"});

    }
  } catch (e) {

    res.status(500).json({success:false,e});
  }
});

// product
router.get("/products", JwtUtil.checkToken, async function (req, res) {
  try {

    const noProducts = await ProductDAO.selectByCount();
    const count = await ProductDAO.countAll();
    console.log(count)
    const sizePage = 4;
    const noPages = Math.ceil(noProducts / sizePage);
    var curPage = 1;
    if (req.query.page) curPage = parseInt(req.query.page); // /products?page=xxx
    const skip = (curPage - 1) * sizePage;
    const products = await ProductDAO.selectBySkipLimit(skip, sizePage);
    console.log(products)
    // return
    const data = { data: products, noPages: noPages, curPage: curPage };
    res.status(200).json({data,success:true});
  } catch (e) {
    res.status(500).json({e,success:false});

  }
   // pagination
});
router.post("/products", JwtUtil.checkToken, async function (req, res) {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const cid = req.body.category;
    const image = req.body.image;
    const decription = req.body.decription;
    if(name&&price&&cid&&image&&decription){

      const numberProduct = await ProductDAO.countAll();
      const d = new Date();
      let ms = d.getMilliseconds();
      const ID = 'PRO'+ms+ (numberProduct+1).toString().padStart(4, "0")
      const now = new Date().getTime(); // milliseconds
      const category = await CategoryDAO.selectByID(cid);
      const product = { name: name, price: price, image: image, cdate: now, category: category ,decription,ID};
      const result = await ProductDAO.insert(product);
      res.status(200).json({data:result,success:true,message:"Thêm thành công"})
    }else{
      res.status(200).json({success:false,message:"Vui lòng nhập đúng trường dữ liệu"})

    }
  } catch (e) {
    res.status(500).json({success:false,e})

  }


});
router.put("/products/:id", JwtUtil.checkToken, async function (req, res) {
  try {

    const _id = req.params.id;
    const name = req.body.name;
    const price = req.body.price;
    const cid = req.body.category;
    const image = req.body.image;
    const decription = req.body.decription;
    if(name&&price&&cid&&image&&decription&&_id){
      const now = new Date().getTime(); // milliseconds
      const category = await CategoryDAO.selectByID(cid);
      const product = {
      _id: _id,
      name: name,
      price: price,
      image: image,
      cdate: now,
      category: category,
      decription
    };
    const result = await ProductDAO.update(product);
    res.status(200).json({data:result,success:true,message:"Thêm thành công"});
    }else{
    res.status(200).json({success:false,message:"Vui lòng không để trống trường dữ liệu"});
  }
} catch (e) {
  res.status(500).json({success:false,e});

  }
});
router.delete("/products/:id", JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    if(_id){
      const result = await ProductDAO.delete(_id);
      res.json({data:result,success:true,message:"Xoá thành công"});
    }else{
      res.json({success:false,message:"Xoá không thành công"});

    }
  } catch (e) {
    res.json({success:false,e});

  }

});
// order
router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectAll();
  res.json(orders);
});// order
router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const newStatus = req.body.status;
  const result = await OrderDAO.update(_id, newStatus);
  res.json(result);
});

// customer
router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
});
// order
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});// customer
router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const token = req.body.token;
  const result = await CustomerDAO.active(_id, token, 0);
  res.json(result);
});
// customer
router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const cust = await CustomerDAO.selectByID(_id);
  if (cust) {
    const send = await EmailUtil.send(cust.email, cust._id, cust.token);
    if (send) {
      res.json({ success: true, message: 'Please check email' });
    } else {
      res.json({ success: false, message: 'Email failure' });
    }
  } else {
    res.json({ success: false, message: 'Not exists customer' });
  }
});

module.exports = router;
