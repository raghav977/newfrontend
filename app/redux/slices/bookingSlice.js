"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  acceptedBid: null, 
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setAcceptedBid: (state, action) => {
      state.acceptedBid = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("acceptedBid", JSON.stringify(action.payload));
      }
    },
    clearAcceptedBid: (state) => {
      state.acceptedBid = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("acceptedBid");
      }
    },
    loadAcceptedBidFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("acceptedBid");
        if (saved) state.acceptedBid = JSON.parse(saved);
      }
    },
  },
});

export const { setAcceptedBid, clearAcceptedBid, loadAcceptedBidFromStorage } =
  bookingSlice.actions;

export default bookingSlice.reducer;
