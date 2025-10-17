import { createAsyncThunk } from "@reduxjs/toolkit";

// public wala--> that no need token or auth

const BASE_URL_PUBLIC = `${process.env.NEXT_PUBLIC_API_BASE_URL}/services`;


export const fetchAllServicesName = createAsyncThunk(
    "services/fetchAllServicesName",
    async(_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL_PUBLIC}/service`);
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || "Failed to fetch all services");
            }
            const data = await response.json();
            return data.data.services || []; 
        }
        catch (err) {
            return rejectWithValue(err.message || "Something went wrong");
        }
    }
)


// services ko image title ra rate wala for dekhauna lai esma chai



export const fetchServicesImageTitleRate = createAsyncThunk(
  "services/fetchServicesImageTitleRate",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Convert params object to query string
      console.log("Fetching services with params:", params);
      const queryString = new URLSearchParams(params).toString();
      console.log("Constructed query string:", queryString);

      const response = await fetch(`${BASE_URL_PUBLIC}/service-picture?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch services");
      }

      const data = await response.json();
      console.log("Fetched services data:", data);

      // Map the API results to the format your UI expects
      const services = data.results.map((service) => ({
        id: service.id,
        name: service.Service?.name,
        rate: service.rate,
        description: service.description,
        images: service.ServiceImages?.map((img) => img.image_path) || [],
        location: service.ServiceLocations?.[0] || null, // optional
        packages: service.Packages || [], // optional
      }));

      return services;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);





export const fetchServiceDetailById = createAsyncThunk(
  "services/fetchServiceDetailById",
  async ({ service, lat, lon }, { rejectWithValue }) => {
    try {
      console.log("Fetching service detail for ID:", service, "with lat:", lat, "and lon:", lon);
      const query = new URLSearchParams();
      if (lat && lon) {
        query.append("lat", lat);
        query.append("lon", lon);
      }

      const response = await fetch(`${BASE_URL_PUBLIC}/service-detail/${service}?${query.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch service details");
      }

      const data = await response.json();
      console.log("SERVICE DETAIL DATA", data);
      return data.data.serviceDetail || null;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);



// fetchmyservices ko lagi chai auth token ko jarurat xa yo chai serviceprovider wala ko lagi

const BASE_URL_PROVIDER = `${process.env.NEXT_PUBLIC_API_BASE_URL}/services/`;

export const fetchMyServices = createAsyncThunk(
    "services/fetchMyServices",
    async ({ limit = 10, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL_PROVIDER}?limit=${limit}&offset=${offset}`,
        {
            credentials: "include",
        }
        );
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.message || "Failed to fetch my services");
        }
        const data = await response.json();
        console.log("This is my services data", data);
        return data || []; 
    }
    catch (err) {
        return rejectWithValue(err.message || "Something went wrong");
    }
    }

)


export const fetchMyServicesTitleRate = createAsyncThunk(
  "services/fetchMyServicesTitleRate",
  async({ limit = 10, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL_PROVIDER}summary?limit=${limit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data", errorData);
        return rejectWithValue(errorData.message || "Failed to fetch my services");
      }
      const data = await response.json();
      console.log("This is my services data summary wala", data.data);
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);







