"use client";
import { useParams } from "next/navigation";
import ServiceImageGallery from "../../../../services-detail/[service]/components/ServiceGallery";
import ServiceInfo from "../../../../services-detail/[service]/components/ServiceInfo";

import MainContent from "./components/MainContent";
export default function ServiceDetailPage(){

    const service = useParams().service;
    console.log("Service ID in Admin Service Detail Page:", service);

    if(!service){
        return <div>Service ID is missing.</div>;
    }

    
    return(
        <div>
            <MainContent/>
        </div>
    )
}