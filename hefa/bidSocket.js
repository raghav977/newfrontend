const { addOnlineUser, removeOnlineUser, emitToRoom } = require("./socketManager");
const { sendNotification, deliverPendingNotifications } = require("../services/notificationService");
const Booking = require("../models/Booking");
const Bid = require("../models/Bid");
const User = require("../models/User");
const { checkValueInModel } = require("../services/validationServices");
const { bidNumberValidation } = require("../helper_functions/numberValidation");
const { Op } = require("sequelize");

const initBidSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ---------------------------
    // Register user and send offline notifications
    // ---------------------------
    socket.on("register", async (userId) => {
      addOnlineUser(userId, socket.id);
      console.log("User online:", userId);

      // Deliver offline notifications
      await deliverPendingNotifications(userId);
    });

    // ---------------------------
    // Join booking room
    // ---------------------------
    socket.on("join-booking-room", ({ bookingId }) => {
      socket.join(`booking-${bookingId}`);
      console.log(`🔹 Socket ${socket.id} joined booking-${bookingId}`);
    });

    // ---------------------------
    // Place bid
    // ---------------------------
    socket.on("place-bid", async ({ bookingId, bidAmount, userId }) => {
      try {
        if (!bookingId || !bidAmount || !userId) return socket.emit("error", { message: "Invalid bid data" });

        const booking = await checkValueInModel(Booking, "id", bookingId);
        if (!booking) return socket.emit("error", { message: "Booking not found" });

        if (!bidNumberValidation(bidAmount).valid) return socket.emit("error", { message: "Invalid bid amount" });

        const acceptedBid = await Bid.findOne({ where: { bookingId, status: "accepted" } });
        if (acceptedBid) return socket.emit("error", { message: "Bidding closed" });

        const newBid = await Bid.create({ bookingId, bidAmount, userId, status: "pending" });
        const user = await User.findByPk(userId);

        // 🔔 Notify booking owner
        await sendNotification(
          booking.userId,
          "New Bid Received",
          `${user?.username || "A user"} placed a bid of ${bidAmount} on your booking.`
        );

        // Emit to booking room
        emitToRoom(`booking-${bookingId}`, "new-bid", {
          ...newBid.toJSON(),
          user: { id: user.id, name: user.username || user.name }
        });

        console.log("✅ New bid placed:", newBid.id);
      } catch (err) {
        console.error("❌ place-bid error:", err);
        socket.emit("error", { message: "Failed to place bid" });
      }
    });

    // ---------------------------
    // Disconnect
    // ---------------------------
    socket.on("disconnect", () => {
      removeOnlineUser(socket.id);
      console.log("❎ User disconnected:", socket.id);
    });
  });
};

module.exports = initBidSocket;
