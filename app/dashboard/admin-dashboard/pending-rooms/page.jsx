"use client"
import {useState,useEffect} from "react"
import DashStatus from "./components/DashStatus"
import PendingRoomList from "./components/PendingRoomList"

export default function PendingPage(){

    const [pendingRooms,setPendingRooms] = useState([])
    const [totalPendingRooms,setTotalPendingRooms] = useState(0);
    const [data,setData] = useState([])

    const fetchPendingRooms = async()=>{
        
        try{
            const response = await fetch("http://localhost:3024/admin/get-rooms?status=pending",{
                credentials:"include"
            });
            const data = await response.json();
            console.log("This is data",data);
            setData(data.data);
            setTotalPendingRooms(data.count);
        }
        catch(err){
            console.error("This is an error",err);
        }
    }

    useEffect(()=>{
        fetchPendingRooms();
    },[])

    return(
        <div>
            <DashStatus total = {totalPendingRooms}/>
            <PendingRoomList list ={data} />
        </div>
    )
}