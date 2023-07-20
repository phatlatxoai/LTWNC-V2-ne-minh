const express = require("express");
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server listening on " + PORT);
});

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.get("/hello", (req, res) => {
  res.json({ message: "hello from server" });
});
app.use('/tmdt/api/admin', require('./api/admin.js'));
app.use('/tmdt/api/customer',require('./api/customer'))



