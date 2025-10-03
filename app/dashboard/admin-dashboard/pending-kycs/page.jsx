"use client"
import { useEffect,useState } from "react";
import DashboardWala from "./components/dashboardwala";
import AllList from "./components/allList"

export default function PendingKycs(){

    const [kyc,setKyc] = useState([]);
    const [totalPending,setTotalPending] = useState(0);
    
    const fetchPendingKyc = async()=>{
        try{
            const response = await fetch("http://localhost:3024/kyc/pending-kyc",{
                credentials:"include"
            });
            if (!response.ok){
                console.log("Fucked off biatch",response);
                return;
            }
            console.log("aayo aayo",await response.json());
            const data = await response.json();
            const kyc = data.kycs;
            console.log("Kyc data",kyc);
            const length= kyc.length;
            setTotalPending(length);
            alert(length);
            setKyc(kyc);
            


        }
        catch(er){
            console.log("This is error",er);

        }
    }
    useEffect(()=>{
        fetchPendingKyc();
    },[])
    useEffect(()=>{
        console.log("Yo kyc ko lagi",kyc);
    },[kyc])

    return(<div>
        <h1>Hello world This is pending kycs page</h1>

        <DashboardWala total={totalPending}/>
        <AllList data={kyc}/>
        

        
        
        {/* {Array.isArray(kyc) && kyc.map((k)=>(
            <div>
                {k.id}
                </div>
        ))} */}
    </div>)
}