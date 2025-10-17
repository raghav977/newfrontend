import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/service`

// const API_BASE = "https://backendwala.onrender.com/api/admin/service";

// -------------------- THUNKS -------------------- //

// Fetch all services (paginated or all)
export const fetchServices = createAsyncThunk(
  "service/fetchServices",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}&search=${search}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("THis is data",data);
      if (!res.ok) throw new Error(data.message || "Failed to fetch services");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Add a new service
export const addService = createAsyncThunk(
  "service/addService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add service");
      return data.newService;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update service
export const updateService = createAsyncThunk(
  "service/updateService",
  async ({ id, name, package_enabled }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/edit/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, package_enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update service");
      return data.updatedService;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete service
export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// -------------------- SLICE -------------------- //

const serviceSlice = createSlice({
  name: "service",
  initialState: {
    list: [],
    total: 0,
    limit: 10,
    offset: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchServices
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        console.log("This is payload", action.payload);
        const { results, total, limit, offset, next, previous } = action.payload;

        state.list = results;
        state.total = total;
        state.limit = limit;
        state.offset = offset;
        state.next = next;
        state.previous = previous;
        state.loading = false;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addService
      .addCase(addService.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addService.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addService.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // updateService
      .addCase(updateService.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateService.fulfilled, (state, action) => {
        console.log("This is updated service", action.payload);
        const index = state.list.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        state.loading = false;
      })
      .addCase(updateService.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // deleteService
      .addCase(deleteService.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteService.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default serviceSlice.reducer;
