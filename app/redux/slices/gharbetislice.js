import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch rooms by type
export const fetchMyRooms = createAsyncThunk(
  "gharbeti/fetchMyRooms",
  async (type = "listed", { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3024/room/my-rooms?type=${type}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return { ...data, type }; 
    } catch (error) {
      console.error(`Fetch my ${type} rooms failed:`, error);
      return rejectWithValue({ message: `Failed to fetch ${type} rooms` });
    }
  }
);

// Slice for rooms
const roomsSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    count: 0,
    loading: false,
    error: null,
    type: "listed", 
  },
  reducers: {
    clearRooms: (state) => {
      state.rooms = [];
      state.count = 0;
      state.loading = false;
      state.error = null;
      state.type = "listed";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms || [];
        state.count = action.payload.count || 0;
        state.type = action.payload.type || "listed";
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch rooms";
      });
  },
});

export const { clearRooms } = roomsSlice.actions;
export default roomsSlice.reducer;
