const router = require("express").Router();
const MessageModel = require('../model/messageModel')
router.post("/addmsg/", async (req, res, next) => {
  try {
    const { from, to, message,imageUrl ,sendAudio} = req.body;
    const data = await MessageModel.create({
      message: message ,
      imageUrl: imageUrl ,
      sendAudio: sendAudio ,
      users: [from, to],
      sender: from,
    })
    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
});

// router.post("/getmsg/", async (req, res, next) => {
//   try {
//     const { from, to } = req.body;
//     const messages = await MessageModel.find({ users: { $all: [from, to],
//       },
//     }).populate('sender').sort({ updatedAt: 1 });
//     const projectedMessages = messages.map((msg) => {
//       return {
//         fromSelf: msg.sender._id.toString() === from,
//         message: msg.message,
//         createdAt: msg.createdAt,
//         userName: msg.sender._id.toString() === from==true? "You":msg.sender.userName,
//         // userName: msg.sender.userName,
//         imageUrl: msg.imageUrl,
//       };
//     });
//     res.send(projectedMessages);
//   } catch (ex) {
//     next(ex);
//   }
// });


module.exports = router;
