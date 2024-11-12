const jwt = require("jsonwebtoken");
const User = require("../../model/User");
const Auth = function(req, res, next) 
{
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Auth Error" });

  try {
    const decoded = jwt.verify(token, "randomString");
    req.user = decoded.user;
    let aa = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};

const verifyTokenAndAuthorization = (req,res,next)=>{
   Auth(req,res, async()=>
  {
      const user = await User.findById(req.user.id);
      if(user.isAdmin==true )
      {
      next();
      }
      else{
          res.status(403).json({message:"You are not allow to do that !"})
      }
  })
}

module.exports = { Auth ,verifyTokenAndAuthorization}