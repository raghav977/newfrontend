import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatComponent from "@/app/user/bookings/[booking_id]/components/ChatComponent";
import { useDispatch, useSelector } from "react-redux";
import { aboutUser } from "@/app/redux/slices/authSlice";

export default function LeftSide({ bookingId }) {
    const [socketRef, setSocketRef] = useState(null);
    const [messages, setMessages] = useState([]);

    const dispatch = useDispatch();



    const CURRENT_USER_ID = useSelector((state) => state.auth?.user?.user?.id);
    
    console.log("Current User ID from Redux:", CURRENT_USER_ID);

    // Fetch bids once when the component mounts
    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/bids/user/bids?bookingId=${bookingId}`, { credentials: "include" });
                const data = await response.json();
                console.log("This is fetch bids", data?.message);

                if (Array.isArray(data.message)) {
                    setMessages(data.message);
                }
            } catch (err) {
                console.error("Error fetching bids", err);
            }
        };

        fetchBids();
        dispatch(aboutUser())
    }, [bookingId]);  // This effect runs when bookingId changes

    // Initialize socket connection once when the component mounts
    useEffect(() => {
        if (!socketRef) {
            // Initialize socket connection
            const socketConnection = io("http://localhost:5000", { withCredentials: true, transports: ["websocket"] });
            setSocketRef(socketConnection);
            console.log("Socket connection established:", socketConnection);

            socketConnection.on("connect", () => {
                console.log("Socket connected:", socketConnection.id);
                socketConnection.emit("register", { message: "hello brother" });
            });

            

            // Cleanup socket connection on unmount
            return () => {
                console.log("Disconnecting socket...");
                socketConnection.disconnect();
            };
        }
    }, []);  

    return (
        <div>
            <header className="p-4 border-b">
                <h2 className="text-2xl font-semibold">Negotiation Room</h2>
            </header>

            {/* Chat component */}
            <ChatComponent 
                messages={messages} 
                socketRef={socketRef}
                bookingId={bookingId}
                currentUserId={CURRENT_USER_ID}
               
            />
        </div>
    );
}
