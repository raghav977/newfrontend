

const Notification = require("../models/Notification")

const responses = require("../http/response");


const getNotifications = async(req,res) => {

    try{
        const userId = req.user.id;
        const limit = parseInt(req.query.limit || 10)

        const notifications = await Notification.findAll({
            where:{
                userId: userId
            },
limit,
order:[['createdAt','DESC']]
        })

        responses.success(res,{
            message:"Notifications fetched successfully",
            data:notifications
        })
    }catch (error) {
        responses.badRequest(res,{
            message:"Error fetching notifications",
            error:error.message
        })
    }
}

const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("This is request body:", req.body);

    await Notification.update({ isRead: true });

    return responses.success(res, "Notifications marked as read");
  } catch (err) {
    console.error("Failed to mark notifications read:", err);
    return responses.serverError(res, "Failed to mark notifications read");
  }
};



module.exports = {
    getNotifications,
    markNotificationsRead
}