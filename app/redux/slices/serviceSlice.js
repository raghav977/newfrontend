import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:5000/api/admin";

// =======================
// Thunks
// =======================

// Fetch all services for the logged-in provider
export const fetchMyServices = createAsyncThunk(
  "services/fetchMyServices",
  async ({limit=4,offset=0}, { rejectWithValue }) => {
    try {
      console.log("Fetching my services with limit:", limit, "and offset:", offset);
      const response = await fetch(`http://localhost:5000/api/services?limit=${limit}&offset=${offset}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch services");
      }
      // console.log("This is my response",response);
      const data = await response.json();
      console.log("This is my services data",data);
      return data; 
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// Fetch services by status (admin view)
export const fetchServiceByStatus = createAsyncThunk(
  "services/fetchByStatus",
  async ({ status, limit = 10, offset = 0 }, { rejectWithValue }) => {
    console.log("This is status",status)
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/service/status?status=${status}&limit=${limit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Sometghingw",errorData)
        return rejectWithValue(errorData.message || "Failed to fetch services by status");
      }
      const data = await response.json();
      console.log("this is data service slice",data.data)
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);


// Fetch all services (for public view / featured etc.)
export const fetchAllServices = createAsyncThunk(
  "services/fetchAllServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}all-services`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch all services");
      }
      const data = await response.json();
      return data.services || []; 
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// Fetch service by ID
export const fetchServiceById = createAsyncThunk(
  "services/fetchServiceById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}service-detail/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch service details");
      }
      const data = await response.json();
      return data.result || null;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);


// public view

// Public view: fetch service by ID (no credentials needed)
export const viewServiceById = createAsyncThunk(
  "services/viewServiceById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}view-detail/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch service");
      }
      const data = await response.json();
      console.log("This is data from the call",data);
      return data.result || null;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);


// =======================
// Slice
// =======================
const serviceSlice = createSlice({
  name: "services",
  initialState: {
    list: [],
    selectedService: null,
    loading: false,
    error: null,
    total: 0,
  limit: 0,
  offset: 0,

  },
  reducers: {
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Services
      .addCase(fetchMyServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.list = action.payload.results || [];
        state.total = action.payload.total || 0;
  state.limit = action.payload.limit || 0;
  state.offset = action.payload.offset || 0;
  state.loading = false;
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Services by Status
      .addCase(fetchServiceByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceByStatus.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchServiceByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(viewServiceById.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(viewServiceById.fulfilled, (state, action) => {
  state.selectedService = action.payload;
  state.loading = false;
})
.addCase(viewServiceById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || action.error.message;
})

      // Fetch All Services
      .addCase(fetchAllServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Service By ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.selectedService = action.payload;
        state.loading = false;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});


export const { clearSelectedService, clearError } = serviceSlice.actions;
export default serviceSlice.reducer;
