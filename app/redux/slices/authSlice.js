import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3024/user";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Fetch logged-in user info
// yo new wala
export const fetchAboutUser = createAsyncThunk(
  "auth/fetchAboutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user info");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch user by ID
export const fetchUserId = createAsyncThunk(
  "user/id",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/id`, { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Login user

// yo pani new wala
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password}, { rejectWithValue }) => {
    console.log("This is email",email)
    console.log("This is password",password)
    // console.log("This is username",username)
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("This is data",data)
      if (!res.ok) return rejectWithValue(data.message || "Login failed");

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);


export const aboutUser = createAsyncThunk(
  "user/aboutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/profile`, {
        credentials: "include", 
      });

      const data = await res.json();
      console.log("This is data",data);

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch user details");
      }

      return data.data; 
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

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
      // fetchAboutUser
      .addCase(fetchAboutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutUser.fulfilled, (state, action) => {
        console.log("This is fetch about user redux action.payload", action.payload);

        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchAboutUser.rejected, (state, action) => {
        
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // fetchUserId
      .addCase(fetchUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Thiis is action.payload",action.payload)
        state.loading = false;
        state.user = action.payload.user;
      })


      builder
  .addCase(aboutUser.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(aboutUser.fulfilled, (state, action) => {
    console.log("This is about user redux action.payload", action.payload);
    state.loading = false;
    state.user = action.payload;
  })
  .addCase(aboutUser.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Something went wrong";
  })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
