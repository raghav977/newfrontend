import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";



const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_UR}/services`;



export const fetchAllServicesReal = createAsyncThunk(
    "services/fetchAllServices",
    async(_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/service`);
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || "Failed to fetch all services");
            }
            const data = await response.json();
            console.log("This is data wala haita",data);
            return data.data.services || []; 
        }
        catch (err) {
            return rejectWithValue(err.message || "Something went wrong");
        }
    }

)


const allServiceSlice = createSlice({
    name:"allServices",
    initialState:{
        list: [],
        loading: false,
        error: null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchAllServicesReal.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }
        )
        .addCase(fetchAllServicesReal.fulfilled, (state, action)=>{
            state.list = action.payload;
            state.loading = false;
        })
        .addCase(fetchAllServicesReal.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload || action.error.message;
        })
    }

})

export default allServiceSlice.reducer;
// export const {} = allServiceSlice.actions;