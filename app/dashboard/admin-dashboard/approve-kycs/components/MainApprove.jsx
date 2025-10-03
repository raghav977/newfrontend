// import React from 'react'
"use client"
import { useEffect,useState } from "react"
import StatsDashboard from './StatsDashboard';
// import ApproveKyc from "../page";
import ApproveKycList from "./ApproveKycList"

export default function MainApprove() {

    const [approvedKyc,setApprovedKyc] = useState([]);
    const [totalApproved,setTotalApproved] = useState(0);

    const fetchApprovedKycs = async()=>{
        try{
            const response = await fetch("http://localhost:3024/kyc/get-kyc?type=approved",{
                credentials:"include"
            });
            if(!response.ok){
                console.log("Something went wrong.",response);
                return;
            }
            const data = await response.json();
            console.log(data.kycs);
            console.log();
            setApprovedKyc(data.kycs);
            setTotalApproved(data.kycs.length);
        }
        catch(err){
            console.log("Something went wrong",err);

        }
    }

    useEffect(()=>{
        fetchApprovedKycs();
    },[])
  return (
    <div>
        {/* heading */}
        <h1 className="text-2xl font-bold">Approved Kycs</h1>
        {/* stats for dashboard */}
        <StatsDashboard total = {totalApproved}/>
        {/* <ApproveKyc></ApproveKyc>
         */}
         <ApproveKycList data={approvedKyc}/>
        

    </div>
  )
}

