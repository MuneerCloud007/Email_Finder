import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api1, Api2 } from "../api/Api";






export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const { url, method, data } = credentials
      const response = await Api1(url, method, data); // Replace with actual API call
      // Save token to localStorage or sessionStorage here if needed
      return response;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const response = await fakeLogoutAPI(); // Replace with actual API call
      // Remove token from localStorage or sessionStorage here if needed
      return response;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for register
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const { url, method, data } = credentials

      const response = await Api1(url, method, data); // Replace with actual API call
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updatePasswordSlice = createAsyncThunk('auth/updatePassword', async (credentials, thunkAPI) => {
  try {
    const { url, method, data } = credentials;
    const response = await Api1(url, method, data); // Replace with actual API call
    return response.data.data;

  }
  catch (err) {
    return thunkAPI.rejectWithValue(err.message)
  }

})

export const getUserData = createAsyncThunk('auth/getUserData', async (credentials, thunkAPI) => {
  try {
    const { url, method } = credentials;
    const response = await Api2(url, method); // Replace with actual API call
    return response.data.data;

  }
  catch (err) {
    return thunkAPI.rejectWithValue(err.message)
  }
})







// Auth slice with initial state and reducers
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    isLoading: false,
    error: null,
    regiser: {
      status: false,
      data: null,
      error: {
        status: false,
        message: ""
      }
    },
    userData: {
      data: null,
      error: {
        status: false,
        message: ""
      },
      loading: false
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        localStorage.setItem("user", JSON.stringify(action.payload.data));
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.regiser.status = false;
        state.regiser.data = null;
        state.regiser.error.status = false;
        state.regiser.error.message = "";
      })
      .addCase(registerAsync.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.regiser.status = true;
        state.regiser.data = payload;
        state.regiser.error.status = false;
        state.regiser.error.message = "";


        // Optionally handle success state update if needed
      })
      .addCase(registerAsync.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.regiser.status = false;
        state.regiser.data = null;
        state.regiser.error.status = true;
        state.regiser.error.message = payload;
      })
      .addCase(getUserData.pending, (state) => {
        state.userData.loading = true;
        state.userData.status = false;
        state.userData.error.message = ""
        state.userData.data = null
      })
      .addCase(getUserData.fulfilled, (state, { payload }) => {
        state.userData.loading = false;
        state.userData.error.status = false;
        state.userData.error.message = ""
        state.userData.data = payload
      })
      .addCase(getUserData.rejected, (state, { payload }) => {
        state.userData.loading = false;
        state.userData.error.status = true;
        state.userData.error.message = payload
        state.userData.data = null
      })
      .addCase(updatePasswordSlice.pending,(state)=>{
        state.userData.loading = true;

      })
      .addCase(updatePasswordSlice.fulfilled,(state,{payload})=>{
        state.userData.loading=false
        alert("Password is updated !!!!!");
      })
      .addCase(updatePasswordSlice.rejected,(state,{payload})=>{
        state.userData.loading = false;
        state.userData.error.status = true;
        state.userData.error.message = payload
        state.userData.data = null
      })

  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;