const express = require("express");
const router = express.Router();
const AddressControllers = require('../controllers/address');
const { Auth ,verifyTokenAndAuthorization} = require("./middleware/auth");
// GET ALL ORDERS
router.get('/findAddress',Auth,verifyTokenAndAuthorization, AddressControllers.get_allAddress);
router.get('/findAddressById/:id', AddressControllers.find_AddressById);
router.post('/addAddress',Auth, AddressControllers.add_Address)

module.exports = router;