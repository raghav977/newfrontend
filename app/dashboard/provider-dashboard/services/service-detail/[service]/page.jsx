"use client"
import { Main } from "next/document";
import MainContent from "./components/mainContent"
import { useParams } from "next/navigation";


export default function ServiceDetailDashboard(){

    const service = useParams().service;
    // alert("THIS IS SERVICE ID "+service);



    return(
        <div>
            {/* service gallery */}

            <MainContent />
            
        </div>
    )
}