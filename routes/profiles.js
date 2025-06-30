const { UpdateProfilePic, UpdateProfile } = require('../controllers/profileControllers');
const router = require("express").Router();

router.patch('/update-profile/:id', UpdateProfile);
router.patch('/picture/:id', UpdateProfilePic);
module.exports = router;
