// ...existing code...
const responses = require("../http/response");
const ServiceSchedules = require("../models/Schedule");
const ServiceProviderServices = require("../models/ServiceProviderService");
const Package = require("../models/package");
const { checkValueInModel, validateContactNumber } = require("../services/validationServices");
const { bidNumberValidation } = require("../helper_functions/numberValidation");
const Booking = require("../models/Booking");
const Bid = require("../models/Bid");
const { checkServiceProviderFromUserId } = require("../services/userServices");
const sequelize = require("../config/db");
const User = require("../models/User");
const BaseController = require("./baseController");
const Service = require("../models/Services");
const { Op } = require("sequelize");
const Notification = require("../models/Notification");
const ServiceProvider = require("../models/ServiceProvider");
const { sendNotification } = require("../services/notificationService");
const { emitToUser } = require("../sockets/socketManager");

let io = null;
const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

const createBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { serviceProviderServiceId, serviceScheduleId, bidAmount, packageId, contact_number } = req.body;

    

    if (!contact_number) return responses.badRequest(res, "Contact number is required");
    if (!validateContactNumber(contact_number))
      return responses.badRequest(res, "Number must start with 98/97 and be 10 digits long");

    if (!serviceScheduleId) return responses.badRequest(res, "Service schedule is required");
    if (!serviceProviderServiceId && !packageId) return responses.badRequest(res, "At least package or service is needed");

    const serviceProviderService = await checkValueInModel(ServiceProviderServices, "id", serviceProviderServiceId);
    if (!serviceProviderService) return responses.badRequest(res, "Service provider service not found");

    const serviceSchedule = await checkValueInModel(ServiceSchedules, "id", serviceScheduleId);
    if (!serviceSchedule) return responses.badRequest(res, "Service schedule not found");

    if (serviceSchedule.serviceProviderServiceId !== serviceProviderServiceId)
      return responses.badRequest(res, "Service schedule does not belong to the specified service");

    let packageObj = null;
    if (packageId) {
      packageObj = await checkValueInModel(Package, "id", packageId);
      if (!packageObj) return responses.badRequest(res, "Package not found");
      if (packageObj.serviceProviderServiceId !== serviceProviderServiceId)
        return responses.badRequest(res, "Package does not belong to the specified service provider service");
    }

    if (bidAmount) {
      if (isNaN(bidAmount)) return responses.badRequest(res, "Bid amount must be a valid number");
      const { valid, message } = bidNumberValidation(bidAmount);
      if (!valid) return responses.badRequest(res, message);
    }

    // Prevent booking your own service
    const serviceProvider = await ServiceProvider.findOne({ where: { userId: user.id } });
    if (serviceProvider && serviceProvider.id === serviceProviderService.serviceProviderId)
      return responses.badRequest(res, "You cannot book your own service");

    // ----------------------------
    // Check existing bookings
    // ----------------------------
    if (serviceProviderServiceId && !packageId) {
      const existingBooking = await Booking.findOne({
        where: {
          userId: user.id,
          serviceProviderServiceId,
          status: { [Op.in]: ["pending", "confirmed"] }
        }
      }, { transaction });
      if (existingBooking) return responses.conflict(res, "You already have a booking for this service that is pending or confirmed");
    }

    if (packageId) {
      const existingPackageBooking = await Booking.findOne({
        where: { userId: user.id, packageId, status: { [Op.in]: ["pending", "accepted"] } }
      }, { transaction });
      if (existingPackageBooking) return responses.conflict(res, "You already have a booking for this package that is pending or accepted");
    }

    // ----------------------------
    // Create booking
    // ----------------------------
    const newBooking = await Booking.create({
      userId: user.id,
      serviceProviderServiceId,
      serviceScheduleId,
      bidAmount: bidAmount || null,
      packageId: packageId || null,
      status: "pending",
      contact_number
    }, { transaction });

    // Get provider userId
    let providerUserId = null;
    const targetProvider = await ServiceProvider.findByPk(serviceProviderService.serviceProviderId, { transaction });
    providerUserId = targetProvider?.userId || null;

    // ----------------------------
    // Notifications
    // ----------------------------
    await sendNotification(user.id, "Booking Created", `Your booking #${newBooking.id} has been created successfully.`);
    if (providerUserId) {
      await sendNotification(providerUserId, "New Booking Created", `A new booking #${newBooking.id} has been created by ${user.name || user.email || user.username}`);
    }

    // ----------------------------
    // Emit WebSocket events
    // ----------------------------
    emitToUser(user.id, "booking-created", { ...newBooking.toJSON(), user: { id: user.id } });
    if (providerUserId) emitToUser(providerUserId, "booking-created", { ...newBooking.toJSON(), user: { id: user.id } });

    // ----------------------------
    // Optional: create bid if bidAmount provided
    // ----------------------------
    let newBid = null;
    if (bidAmount) {
      newBid = await Bid.create({ bookingId: newBooking.id, bidAmount, userId: user.id, status: "pending" }, { transaction });

      if (providerUserId) await sendNotification(providerUserId, "New Bid Placed", `A new bid of ${bidAmount} has been placed on booking #${newBooking.id}`);
      await sendNotification(user.id, "Bid Submitted", `Your bid of ${bidAmount} for booking #${newBooking.id} has been submitted`);

      emitToUser(user.id, "new-bid", { ...newBid.toJSON(), user: { id: user.id } });
      if (providerUserId) emitToUser(providerUserId, "new-bid", { ...newBid.toJSON(), user: { id: user.id } });
    }

    await transaction.commit();
    return responses.created(res, { newBooking, newBid }, "Booking created successfully.");
  } catch (err) {
    await transaction.rollback();
    console.error("❌ createBooking error:", err);
    return responses.serverError(res, "An error occurred while creating the booking.");
  }
};

// provider - get bookings
const getProviderBookings = async (req, res) => {
  try {
    const provider = await checkServiceProviderFromUserId(req.user.id);
    if (!provider) return responses.forbidden(res, "Not a provider.");

    const bookings = await Booking.findAll({
      where: { serviceProviderServiceId: { [Op.ne]: null } },
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: ServiceSchedules },
        { model: Package },
        { model: Bid },
        {
          model: ServiceProviderServices,
          where: { serviceProviderId: provider.id },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return responses.success(res, "Provider bookings fetched.", bookings);
  } catch (err) {
    console.error(err);
    return responses.serverError(res, "Could not fetch provider bookings.");
  }
};

class ProviderBookingController extends BaseController {
  constructor() {
    super(Booking, {
      searchFields: ["id"],
      filterFields: ["status", "serviceProviderServiceId"],
      defaultLimit: 10,
    });
  }

  // GET /provider/bookings?status=Pending,Accepted&limit=10&offset=0
  async providerList(req, res) {
    try {
      const provider = await checkServiceProviderFromUserId(req.user.id);
      if (!provider) return res.status(403).json({ error: "Not a service provider" });

      const limit = parseInt(req.query.limit) || this.defaultLimit;
      const offset = parseInt(req.query.offset) || 0;
      const statusFilter = req.query.status ? req.query.status.split(",") : null;

      const where = {};
      if (req.query.serviceProviderServiceId) {
        where.serviceProviderServiceId = req.query.serviceProviderServiceId;
      }
      if (statusFilter) {
        where.status = { [Op.in]: statusFilter.map(s => String(s).toLowerCase()) };
      }

      const { count, rows } = await this.model.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, attributes: ["id", "name", "email"] },
          { model: Package, attributes: ["id", "name", "price"] },
          { model: ServiceSchedules, attributes: ["id", "day_of_week", "start_time", "end_time"] },
          {
            model: ServiceProviderServices,
            attributes: ["id", "serviceProviderId"],
            include: { model: Service, attributes: ["id", "name"] },
          },
          { model: Bid, attributes: ["id", "bidAmount", "status", "createdAt"] },
        ],
      });

      res.json({
        total: count,
        limit,
        offset,
        results: rows,
        next: offset + limit < count ? offset + limit : null,
        previous: offset - limit >= 0 ? offset - limit : null,
      });
    } catch (err) {
      console.error("Error in providerList:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

/**
 * Cancel a booking.
 * Only the booking owner (booking.userId) may cancel.
 * Only pending bookings can be cancelled.
 */
const cancelBooking = async (req, res, next) => {
  try {
    const user = req.user;
    const rawBookingId = req.params?.bookingId ?? req.body?.bookingId;

    if (!rawBookingId) {
      return responses.badRequest(res, "Booking ID is required");
    }

    const bookingId = Number(rawBookingId);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return responses.badRequest(res, "Invalid booking ID");
    }

    const booking = await checkValueInModel(Booking, "id", bookingId);
    if (!booking) {
      return responses.notFound(res, "Booking not found");
    }

    if (!user || !user.id) {
      return responses.forbidden(res, "Authentication required");
    }

    if (String(booking.userId) !== String(user.id)) {
      return responses.forbidden(res, "You can only cancel your own bookings");
    }

    const currentStatus = String(booking.status || "").toLowerCase();

    if (currentStatus === "cancelled") {
      return responses.badRequest(res, "Booking is already cancelled");
    }

    if (currentStatus !== "pending") {
      return responses.badRequest(res, "Only pending bookings can be cancelled");
    }

    booking.status = "cancelled";
    await booking.save();

    // create notifications (non-blocking)
    (async () => {
      try {
        await Notification.create({
          userId: booking.userId,
          title: "Booking Cancelled",
          message: `Booking #${booking.id} has been cancelled.`,
          isRead: false,
        });





        // resolve provider user and notify
        if (booking.serviceProviderServiceId) {
          const sps = await ServiceProviderServices.findByPk(booking.serviceProviderServiceId);
          if (sps) {
            const provider = await ServiceProvider.findByPk(sps.serviceProviderId);
            if (provider && provider.userId) {
              await Notification.create({
                userId: provider.userId,
                title: "Booking Cancelled",
                message: `Booking #${booking.id} has been cancelled by the customer.`,
                isRead: false,
              });
            }
          }
        }
      } catch (notifyErr) {
        console.error("Failed to create cancel notifications:", notifyErr);
      }
    })();

    // emit socket event if available
    try {
      if (io) {
        io.to(`booking-${bookingId}`).emit("booking-updated", {
          bookingId,
          status: booking.status,
        });
      }
    } catch (emitErr) {
      console.error("Failed to emit booking-updated:", emitErr);
    }

    return responses.success(res, booking, "Booking cancelled successfully");
  } catch (err) {
    console.error("Error in cancelBooking:", err);
    return responses.serverError(res, "An error occurred while cancelling the booking.");
  }
};

module.exports = {
  createBooking,
  setSocketInstance,
  getProviderBookings,
  ProviderBookingController,
  cancelBooking,
};
