import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to fetch document types
export const fetchDocumentType = createAsyncThunk(
  "document/fetchDocumentType",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:5000/api/kyc/document-type/", {
        credentials: "include", 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch document types");
      }

      const data = await response.json();
      console.log("Fetched document types:", data.data.type);
      return data.data.type;
    } catch (err) {
      console.error("Something went wrong:", err);
      return rejectWithValue(err.message);
    }
  }
);

const documentTypeSlice = createSlice({
  name: "document",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentType.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDocumentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default documentTypeSlice.reducer;
