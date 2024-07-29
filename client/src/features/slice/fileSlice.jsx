import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { Api1, Api2 } from "../api/Api";


//new Folder

export const getAllFileSlice = createAsyncThunk("/api/Folder/getAll", async (postData, thunkApi) => {
  try {

    const { url, method } = postData;
    const response = await Api2(url, method);

    return response.data;
  }
  catch (e) {
    throw thunkApi.reject(e);

  }
})



const fileSlice = createSlice({
  name: "fileSlice",
  initialState: {


    FileData: {
      loading: false,
      data: null,
      error: {
        error: false,
        message: null
      }
    },
    
    Credit:{
      data:{
      points:null,
      
      plan:null,
      },
      loading:false,
      error:{
        status:false,
        message:null
      }
    }


  },
  
  reducers: {
  
    updateCredits:(state,{payload})=>{
      state.Credit.data.plan=payload.plan;
      state.Credit.data.points=payload.points;
    }

  },
  extraReducers: (builder) => {


    builder.addCase(getAllFileSlice.pending, (state, { payload }) => {
      state.FileData.loading = true;

    })
    builder.addCase(getAllFileSlice.fulfilled, (state, { payload }) => {
      state.FileData.data = payload.data;
      state.FileData.loading = false;
    })
    builder.addCase(getAllFileSlice.rejected, (state, { payload }) => {
      state.FileData.data = null;
      state.FileData.loading = false;
      state.FileData.error.error = true;
      state.FileData.error.message = payload.message || "ERROR in getALL FIle Slice";
    })

 
    









  },
});
export const { updateCredits } = fileSlice.actions;
export default fileSlice.reducer;
