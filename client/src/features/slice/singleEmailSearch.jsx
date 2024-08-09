import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { Api1, Api2 } from "../api/Api";


// Define the async thunk for fetching email verification
export const singleEmailSearchSlice = createAsyncThunk(
  '/emailVerification/singleEmailSearch',
  async ({data,url,method }, { rejectWithValue }) => {
    try {
        
      const response = await Api1(url,method,data);
      return response.data;
    } catch (error) {
        throw rejectWithValue(error.message);
    }
  }
);

export const getAllSingleEmailSearchSlice=createAsyncThunk("/single/getAll/EmailSearch",async({data,url,method},{ rejectWithValue })=>{
    try{
        const response = await Api1(url,method,data);
        return response.data;


    }
    catch(err){
        throw rejectWithValue(error.message);


    }
})

// Define the initial state
const initialState = {
  loading:false,
  data:null,
  errror:{
    message:null,
    status:null
  }
};

// Create the slice
const singleEmailSearch = createSlice({
  name: 'singleEmailSearch',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSingleEmailSearchSlice.pending, (state) => {
        state.loading=true
        state.data=null;
      })
      .addCase(getAllSingleEmailSearchSlice.fulfilled, (state, action) => {
        state.loading=false
        state.data = action.payload;
      })
      .addCase(getAllSingleEmailSearchSlice.rejected, (state, action) => {
        state.loading=false
        state.data=null;
        state.errror.status=true;
        state.errror.message=action.payload;
      });
  }
});

// Export the reducer to be included in the store
export default singleEmailSearch.reducer;
