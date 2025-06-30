const {uploads} = require('../controllers/imageUrlControllers');
const router = require("express").Router();

router.post("/uploads/", uploads);

module.exports = router;
