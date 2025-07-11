const MessageModel = require("../model/messageModel");
const User = require("../model/User");

module.exports = (io) => {
  // Track online users in memory
  const onlineUsers = new Map();
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    // Mark user as online in MongoDB
    socket.on("user-online", async ({ user }) => {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { isOnline: true } },
        { new: true }
      )

      // Notify others
      socket.broadcast.emit("getOnlineUser", { data: updatedUser });
    });

    // Add user to socket map
    socket.on("add-user", async (userId) => {
      try {
        // ✅ 1. Update user's isOnline status in DB
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: { isOnline: true } },
          { new: true }
        ).select("_id userName isOnline");

        if (updatedUser) {
          // ✅ 2. Add user to online users map
          onlineUsers.set(userId, {
            socketId: socket.id,
            userName: updatedUser.userName,
          });

          // ✅ 3. Emit updated list of online users
          const onlineUserList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
            _id: userId,
            userName: data.userName,
          }));

          io.emit("getOnlineUser", onlineUserList);

          // ✅ 4. Broadcast user status to others (optional)
          socket.broadcast.emit("status-message", {
            _id: updatedUser._id,
            userName: updatedUser.userName,
            isOnline: true,
            message: `${updatedUser.userName} is online`,
            lastUpdatedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to add user and update status:", err);
      }
    });


    // Handle incoming message
    socket.on("send-msg", async (data) => {
      const { from, to, message, imageUrl, sendAudio } = data;

      try {
        // After saving the message
        const savedMessage = await MessageModel.create({
          message,
          imageUrl,
          sendAudio,
          users: [from, to],
          sender: from,
        });

        // Fetch sender info
        await savedMessage.populate("sender");

        const formattedMessage = {
          fromSelf: false, // For receiver
          message: savedMessage.message,
          createdAt: savedMessage.createdAt,
          userName: savedMessage.sender.userName,
          imageUrl: savedMessage.imageUrl,
        };
        // Emit to recipient
        const recipient = onlineUsers.get(to);
        if (recipient && recipient.socketId) {
          io.to(recipient.socketId).emit("msg-received", formattedMessage);
        }

        // Emit back to sender (fromSelf: true)
        socket.emit("msg-sent", {
          ...formattedMessage,
          fromSelf: true,
          userName: "You",
        });


      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("msg-error", { error: "Message not sent" });
      }
    });


    // Fetch message history between two users
    socket.on("get-previous-messages", async ({ from, to }) => {
      const messages = await MessageModel.find({
        users: { $all: [from, to] },
      })
        .populate("sender")
        .sort({ createdAt: 1 });

      const projectedMessages = messages.map((msg) => ({
        fromSelf: msg.sender._id.toString() === from,
        message: msg.message,
        createdAt: msg.createdAt,
        userName: msg.sender._id.toString() === from ? "You" : msg.sender.userName,
        imageUrl: msg.imageUrl,
      }));

      socket.emit("previous-messages", projectedMessages);
    });

    socket.on("disconnect", async () => {
      for (let [userId, data] of onlineUsers.entries()) {
        console.log("add-user called for:", userId);

        if (data.socketId === socket.id) {
          onlineUsers.delete(userId);
          const offileuser = await User.findByIdAndUpdate(
            userId,
            { $set: { isOnline: true } },
            { new: true }
          )
          io.emit("status-message", {
            _id: userId,
            userName: data.userName,
            isOnline: false,
            message: `${data.userName} went offline`,
            lastUpdatedAt: offileuser.updatedAt,
          });
        }
      }

      // Emit updated user list
      const onlineUserList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
        _id: userId,
        userName: data.userName,
      }));
      io.emit("getOnlineUser", onlineUserList);
    });

  });
};
