import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`
// const BASE_URL = "https://backendwala.onrender.com/api/users";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// 🔹 Fetch logged-in user profile
export const fetchAboutUser = createAsyncThunk(
  "auth/fetchAboutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user info");
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Fetch currently authenticated user by ID
export const fetchUserId = createAsyncThunk(
  "auth/fetchUserId",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/id`, { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Login failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// 🔹 Fetch detailed user info (same as profile, but can be extended)
export const aboutUser = createAsyncThunk(
  "auth/aboutUser",
  async (_, { rejectWithValue }) => {
    try {
      console.log("aboutUser thunk called");
      const res = await fetch(`${BASE_URL}/profile`, { credentials: "include" });
      const data = await res.json();
      console.log("aboutUser response:", data);
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch user details");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// 🔹 Helper: normalize user data no matter what API returns
const normalizeUser = (payload) => {
  // Handles { user: {...} }, { data: {...} }, or {...}
  return payload?.user || payload?.data || payload || null;
};

// 🔹 Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔸 fetchAboutUser
      .addCase(fetchAboutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
      })
      .addCase(fetchAboutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user info";
      })

      // 🔸 fetchUserId
      .addCase(fetchUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
      })
      .addCase(fetchUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Not authenticated";
      })

      // 🔸 loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // 🔸 aboutUser
      .addCase(aboutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(aboutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
      })
      .addCase(aboutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user details";
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
