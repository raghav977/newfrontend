import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = 'http://localhost:3024';

// 🔹 Fetch subcategories
export const fetchSubcategories = createAsyncThunk(
  "subcategories/fetchSubcategories",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/services/fetch-categories/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      const data = await response.json();
      return data; // { message, data: [...] }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Edit subcategory
export const editSubcategory = createAsyncThunk(
  "subcategories/editSubcategory",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/services/edit-category/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to edit subcategory");
      const data = await response.json();
      return data.data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Delete subcategory
export const deleteSubcategory = createAsyncThunk(
  "subcategories/deleteSubcategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/services/delete-category/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete subcategory");
      return id; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const subcategorySlice = createSlice({
  name: "subcategories",
  initialState: {
    data: [], 
    loading: false,
    error: null,
  },
  reducers: {
    clearSubcategories: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; 
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // edit
      .addCase(editSubcategory.fulfilled, (state, action) => {
        const index = state.data.findIndex((sc) => sc.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
      })

      // delete
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.data = state.data.filter((sc) => sc.id !== action.payload);
      });
  },
});

export const { clearSubcategories } = subcategorySlice.actions;

export default subcategorySlice.reducer;
