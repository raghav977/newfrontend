
import { io } from "socket.io-client";

let socket;


// export const connectSocket = (token)=>{
//     console.log("Connecting socket with token:", token);
//     if(!socket){
//         socket = io("http://localhost:5000",{
//             auth:{
//                 token
//             },
//             transports:["websocket"]
//         });
//     }

//     console.log("Socket instance:", socket);

//     socket.on("connect",()=>{
//         console.log("Socket connected:", socket.id);

//         socket.emit("register",{token})
//     })
    

//     socket.on("disconnect", ()=>{
//         console.log("Socket disconnected:");
//     });

//     return socket;

// }



export const connectSocketConnection = ()=>{
    if(!socket){
        socket = io("http://localhost:5000",{
            withCredentials:true,
            transports:["websocket"]
        });
    }
    console.log("This is socket instance:", socket);

    socket.on("connect", ()=>{
        console.log("Socket connected:", socket.id);

        
    });

    socket.on("disconnect", ()=>{
        console.log("Socket disconnected:");
    });

    return socket;




}