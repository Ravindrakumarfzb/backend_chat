const router = require("express").Router();
const { check } = require("express-validator");
const { Auth, verifyTokenAndAuthorization } = require("./middleware/auth");
const UsersControllers = require('../controllers/user');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null,file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.post( "/signup", [
      check("email", "Please enter a valid email").isEmail(),
      check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  UsersControllers.UserSignUp
);

router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ],
  UsersControllers.UserLogin
);

router.get("/me/:id", UsersControllers.findByIdUser);
router.get('/allUser',UsersControllers.FindAllUserList);
router.post('/email-send',UsersControllers.emailSend);
router.post('/change-password',UsersControllers.changePassword);


module.exports = router;