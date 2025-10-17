const BaseController = require("./baseController");
const { Op } = require("sequelize");
const Booking = require("../models/Booking");
const Bid = require("../models/Bid");
const User = require("../models/User");
const ServiceProviderServices = require("../models/ServiceProviderService");
const Package = require("../models/package");
const ServiceSchedules = require("../models/Schedule");
const Service = require("../models/Services");
const { sendNotification } = require("../services/notificationService");
const { emitToUser, emitToRoom } = require("../sockets/socketManager");
const responses = require("../http/response");
const { checkValueInModel } = require("../services/validationServices");

// ----------------------------
// User Booking Controller
// ----------------------------
class UserBookingController extends BaseController {
  constructor() {
    super(Booking, {
      searchFields: ["id"],
      filterFields: ["status", "userId"],
      defaultLimit: 10
    });
  }

  // GET /user/bookings
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;

      const bookings = await Booking.findAll({
        where: { userId },
        include: [
          { model: User, attributes: ["id", "name", "email"] },
          { model: Bid, attributes: ["id", "bidAmount", "status", "createdAt"] },
          { model: ServiceSchedules, attributes: ["id","day_of_week","start_time","end_time"] },
          { model: Package, attributes: ["id","name","price"] },
          { 
            model: ServiceProviderServices, 
            attributes: ["id","serviceProviderId"],
            include: { model: Service, attributes: ["id","name"] }
          }
        ],
        order: [["createdAt", "DESC"]]
      });

      return responses.success(res, "User bookings fetched successfully", bookings);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      return responses.serverError(res, "Failed to fetch user bookings.");
    }
  }
}

// ----------------------------
// Fetch Bids for a Booking
// GET /api/bids/user?bookingId=<id>
// ----------------------------
const getUserBids = async (req, res) => {
  try {
    const bookingId = Number(req.query.bookingId);
    if (!bookingId || bookingId <= 0) return responses.badRequest(res, "Valid bookingId is required.");

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return responses.notFound(res, "Booking not found.");
    if (booking.userId !== req.user.id) return responses.unauthorized(res, "Not authorized to view bids.");

    const bids = await Bid.findAll({
      where: { bookingId },
      attributes: ["id", "bidAmount", "status", "createdAt"],
      include: [
        {
          model: Booking,
          attributes: ["id", "status"],
          include: { model: User, attributes: ["id", "name", "email"] }
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    return responses.success(res, "Bids fetched successfully.", bids);
  } catch (err) {
    console.error("Error fetching bids:", err);
    return responses.serverError(res, "Failed to fetch bids.");
  }
};

// ----------------------------
// Accept Bid
// POST /api/bid/accept
// ----------------------------
const acceptBid = async (req, res) => {
  const { bidId, bookingId, userId } = req.body;
  const transaction = await Bid.sequelize.transaction();

  try {
    if (!bidId || !bookingId || !userId) return res.status(400).json({ message: "Invalid data" });

    const bid = await Bid.findOne({ where: { id: bidId }, include: [{ model: Booking }] });
    if (!bid || !bid.Booking) return res.status(404).json({ message: "Bid or Booking not found" });
    if (bid.Booking.userId === userId || bid.userId === userId)
      return res.status(403).json({ message: "Cannot accept own bid" });

    const booking = await checkValueInModel(Booking, "id", bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Update statuses
    booking.status = "confirmed";
    await booking.save({ transaction });

    bid.status = "accepted";
    await bid.save({ transaction });

    await Bid.update(
      { status: "rejected" },
      { where: { bookingId, id: { [Op.ne]: bidId }, status: "pending" }, transaction }
    );

    const bidder = await User.findByPk(bid.userId);

    await sendNotification(bid.userId, "Bid Accepted", `Your bid on booking #${bookingId} has been accepted.`);
    await sendNotification(booking.userId, "Bid Accepted Confirmation", `You accepted a bid for booking #${bookingId}.`);

    emitToRoom(`booking-${bookingId}`, "bid-accepted", {
      bookingId,
      bookingStatus: booking.status,
      bid: { ...bid.toJSON(), user: bidder ? { id: bidder.id, name: bidder.name || bidder.username } : null }
    });

    await transaction.commit();
    return res.status(200).json({ message: "Bid accepted successfully", bid, booking });
  } catch (err) {
    await transaction.rollback();
    console.error("acceptBid error:", err);
    return res.status(500).json({ message: "Failed to accept bid" });
  }
};

// ----------------------------
// Decline Bid
// POST /api/bid/decline
// ----------------------------
const declineBid = async (req, res) => {
  const { bidId, bookingId, userId } = req.body;
  const transaction = await Bid.sequelize.transaction();

  try {
    const bid = await checkValueInModel(Bid, "id", bidId);
    const booking = await checkValueInModel(Booking, "id", bookingId);

    if (!bid || !booking) return res.status(404).json({ message: "Bid or Booking not found" });

    const sps = await ServiceProviderServices.findByPk(booking.serviceProviderServiceId);
    if (!sps || sps.serviceProviderId !== userId)
      return res.status(403).json({ message: "Only provider can decline bids" });

    bid.status = "rejected";
    await bid.save({ transaction });

    await sendNotification(bid.userId, "Bid Rejected", `Your bid on booking #${bookingId} has been declined.`);

    emitToRoom(`booking-${bookingId}`, "bid-rejected", bid);

    await transaction.commit();
    return res.status(200).json({ message: "Bid rejected successfully", bid });
  } catch (err) {
    await transaction.rollback();
    console.error("declineBid error:", err);
    return res.status(500).json({ message: "Failed to decline bid" });
  }
};

// ----------------------------
// Exports
// ----------------------------
module.exports = { UserBookingController, getUserBids, acceptBid, declineBid };
