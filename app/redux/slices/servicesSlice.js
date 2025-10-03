import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllServicesName,
  fetchServicesImageTitleRate,
  fetchServiceDetailById,
  fetchMyServices,
  fetchMyServicesTitleRate
} from "../thunks/serviceThunks";

const initialState = {
  publicServicesNames: {
    list: [],
    loading: false,
    error: null,
  },
  publicServicesCards: {
    list: [],
    loading: false,
    error: null,
    total: 0,
    limit: 10,
    offset: 0,
    next: null,
    previous: null,
  },
  selectedService: {
    data: null,
    loading: false,
    error: null,
  },
  myServices: {
    list: [],
    loading: false,
    error: null,
    total: 0,
    limit: 10,
    offset: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  },
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearError: (state) => {
      state.publicServicesNames.error = null;
      state.publicServicesCards.error = null;
      state.selectedService.error = null;
      state.myServices.error = null;
    },
    clearSelectedService: (state) => {
      state.selectedService.data = null;
      state.selectedService.loading = false;
      state.selectedService.error = null;
    },
    clearMyServices: (state) => {
      state.myServices = {
        list: [],
        loading: false,
        error: null,
        total: 0,
        limit: 10,
        offset: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
      };
    },
  },
  extraReducers: (builder) => {
    // ----------------------
    // fetchAllServicesName
    // ----------------------
    builder
      .addCase(fetchAllServicesName.pending, (state) => {
        state.publicServicesNames.loading = true;
        state.publicServicesNames.error = null;
      })
      .addCase(fetchAllServicesName.fulfilled, (state, action) => {
        state.publicServicesNames.loading = false;
        state.publicServicesNames.list = action.payload;
      })
      .addCase(fetchAllServicesName.rejected, (state, action) => {
        state.publicServicesNames.loading = false;
        state.publicServicesNames.error = action.payload || action.error.message;
      });

    // ----------------------
    // fetchServicesImageTitleRate
    // ----------------------
    builder
      .addCase(fetchServicesImageTitleRate.pending, (state) => {
        state.publicServicesCards.loading = true;
        state.publicServicesCards.error = null;
      })
      .addCase(fetchServicesImageTitleRate.fulfilled, (state, action) => {
        console.log("Payload in reducer:", action.payload);
        state.publicServicesCards.loading = false;
        state.publicServicesCards.list = action.payload.list || action.payload.results||action.payload || [];
        state.publicServicesCards.total = action.payload.total || 0;
        state.publicServicesCards.limit = action.payload.limit || 10;
        state.publicServicesCards.offset = action.payload.offset || 0;
        state.publicServicesCards.next = action.payload.next || null;
        state.publicServicesCards.previous = action.payload.previous || null;
      })
      .addCase(fetchServicesImageTitleRate.rejected, (state, action) => {
        state.publicServicesCards.loading = false;
        state.publicServicesCards.error = action.payload || action.error.message;
      });

    // ----------------------
    // fetchServiceDetailById
    // ----------------------
    builder
      .addCase(fetchServiceDetailById.pending, (state) => {
        state.selectedService.loading = true;
        state.selectedService.error = null;
      })
      .addCase(fetchServiceDetailById.fulfilled, (state, action) => {
        state.selectedService.loading = false;
        state.selectedService.data = action.payload;
      })
      .addCase(fetchServiceDetailById.rejected, (state, action) => {
        state.selectedService.loading = false;
        state.selectedService.error = action.payload || action.error.message;
      });

    // ----------------------
    // fetchMyServices
    // ----------------------
    builder
      .addCase(fetchMyServices.pending, (state) => {
        state.myServices.loading = true;
        state.myServices.error = null;
      })
      builder.addCase(fetchMyServicesTitleRate.pending, (state) => {
        state.myServices.loading = true;
        state.myServices.error = null;
      })
      .addCase(fetchMyServicesTitleRate.fulfilled, (state, action) => {
        console.log("Payload in reducer of my services title rate bc:", action.payload);
        state.myServices.loading = false;
        state.myServices.list = action.payload.list ||action.payload.results || [];
        state.myServices.total = action.payload.total || 0;
        state.myServices.limit = action.payload.limit || 10;
        state.myServices.offset = action.payload.offset || 0;
        state.myServices.next = action.payload.next || null;
        state.myServices.previous = action.payload.previous || null;
        state.myServices.currentPage =
          Math.floor((action.payload.offset || 0) / (action.payload.limit || 1)) + 1;
        state.myServices.totalPages = Math.ceil(
          (action.payload.total || 0) / (action.payload.limit || 1)
        );
      })
      .addCase(fetchMyServicesTitleRate.rejected, (state, action) => {
        state.myServices.loading = false;
        state.myServices.error = action.payload || action.error.message;
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        console.log("Payload in reducer of my services:", action.payload);
        state.myServices.loading = false;
        state.myServices.list = action.payload.list ||action.payload.results || [];
        state.myServices.total = action.payload.total || 0;
        state.myServices.limit = action.payload.limit || 10;
        state.myServices.offset = action.payload.offset || 0;
        state.myServices.next = action.payload.next || null;
        state.myServices.previous = action.payload.previous || null;
        state.myServices.currentPage =
          Math.floor((action.payload.offset || 0) / (action.payload.limit || 1)) + 1;
        state.myServices.totalPages = Math.ceil(
          (action.payload.total || 0) / (action.payload.limit || 1)
        );
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.myServices.loading = false;
        state.myServices.error = action.payload || action.error.message;
      });
  },
});

export const { clearError, clearSelectedService, clearMyServices } = serviceSlice.actions;
export default serviceSlice.reducer;
