import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3024/kyc/";


export const fetchApprovedKycs = createAsyncThunk(
    "kyc/fetchApproveKycs",
    async()=>{
        const response = await fetch(`${BASE_URL}get-kyc?type=approved`,{
            credentials:"include"
        })
        const data = await response.json();
        const kyc = data.kycs;
        return kyc;

        
         
    }
)

export const fetchKycCategory = createAsyncThunk(

    "kyc/fetchcategory",async()=>{
        try{
            const response = await fetch("http://localhost:3024/kyc/categories/")
            
        }
        catch(err){

        }
    }

)