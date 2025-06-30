const messageModel = require("../model/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await messageModel.find({
      users: {
        $all: [from, to],
      },
    }).populate('sender').sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender._id.toString() === from,
        message: msg.message,
        createdAt: msg.createdAt,
        userName: msg.sender._id.toString() === from==true? "You":msg.sender.userName,
        // userName: msg.sender.userName,
        imageUrl: msg.imageUrl,
      };
      
    });
    res.send(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message,imageUrl ,sendAudio} = req.body;
    
    const data = await messageModel.create({
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
};
