import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { Api1, Api2 } from "../api/Api";


//new Folder

export const getAllFolderSlice = createAsyncThunk("/api/Folder/getAll", async (postData, thunkApi) => {
  try {

    const { url, method } = postData;
    const response = await Api2(url, method);

    return response.data;
  }
  catch (e) {
    throw thunkApi.reject(e);

  }
})


export const getAllEmailVerifier = createAsyncThunk("/api/EmailVerifier/getAll", async (postData, thunkApi) => {
  try {

    const { url, method, data } = postData;
    const response = await Api1(url, method, data);

    return response.data;
  }
  catch (e) {
    throw thunkApi.reject(e);

  }
})


export const NewFolderSlice = createAsyncThunk("/api/Folder/create", async (postData, thunkApi) => {
  try {

    const { url, method, data } = postData;
    const response = await Api1(url, method, data);
    return response.data;
  }
  catch (err) {

    throw thunkApi.reject(err);

  }
})

export const renameFolderSlice=createAsyncThunk("/api/Folder/Rename",async (postData,thunkApi)=>{
  try{
    const {url,method,data}=postData;
    const response=await Api1(url,method,data);
    return response.data;

  }
  catch(err){
    throw thunkApi.reject(err);

  }
})

export const updateFolderSlice = createAsyncThunk("/api/Folder/update", async (postData, thunkApi) => {
  try {
    const { url, method, data } = postData;
    const response = await Api1(url, method, data);
    return response.data;


  }
  catch (err) {
    throw thunkApi.reject(err);


  }
})

export const deleteFolderSlice = createAsyncThunk("/api/Folder/delete", async (postData, thunkApi) => {
  try {

    const { url, method } = postData;
    console.log(url);
    console.log(method);
    const response = await Api2(url, method);

    return response.data;
  }
  catch (e) {
    throw thunkApi.reject(e);

  }
})

export const getCreditSlice=createAsyncThunk("/api/user/credit/get",async (postData,thunkApi)=>{
  try{
    const {url,method}=postData;
    const response=await Api2(url,method);
    return response.data.data;
  }
  catch(error){
    throw thunkApi.reject(error.message);
  }
})


const emailVerifierSlice = createSlice({
  name: "emailVerifier",
  initialState: {


    FolderData: {
      loading: false,
      data: null,
      error: {
        error: false,
        message: null
      }
    },
    EmailVerifier: {
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
    addEmailVerifier: (state, action) => {
      console.log(current(state.EmailVerifier.data));
      const payload = action.payload;
      const payloadKey = Object.keys(payload)[0]; // Assuming payload has only one key
      state.EmailVerifier.data = {
        ...state.EmailVerifier.data,
        [payloadKey]: [...(state.EmailVerifier.data[payloadKey] || payload[payloadKey])],
      };
    },
    updateCredits:(state,{payload})=>{
      state.Credit.data.plan=payload.plan;
      state.Credit.data.points=payload.points;
    }

  },
  extraReducers: (builder) => {


    builder.addCase(getAllFolderSlice.pending, (state, { payload }) => {
      state.FolderData.loading = true;

    })
    builder.addCase(getAllFolderSlice.fulfilled, (state, { payload }) => {
      state.FolderData.data = payload.data;
      state.FolderData.loading = false;
    })
    builder.addCase(getAllFolderSlice.rejected, (state, { payload }) => {
      state.FolderData.data = null;
      state.FolderData.loading = false;
      state.FolderData.error.error = true;
      state.FolderData.error.message = payload.message;
    })

    builder.addCase(getAllEmailVerifier.pending, (state, { payload }) => {
      state.EmailVerifier.loading = true;
    })
    builder.addCase(getAllEmailVerifier.fulfilled, (state, { payload }) => {
      state.EmailVerifier.data = payload.data;
      state.EmailVerifier.loading = false;
    })
    builder.addCase(getAllEmailVerifier.rejected, (state, { payload }) => {
      state.EmailVerifier.data = null;
      state.EmailVerifier.loading = false;
      state.EmailVerifier.error.error = true;
      state.EmailVerifier.error.message = payload?.message;
    })

    builder.addCase(NewFolderSlice.pending, (state) => {
      state.loading = true;
    })
    builder.addCase(NewFolderSlice.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.FolderData.data = [...state.FolderData.data, payload.data];
    })

    builder.addCase(NewFolderSlice.rejected, (state, { payload }) => {
      state.loading = false;
      state.FolderData.data = null;
      state.FolderData.error.error = true;
      state.FolderData.error.message = payload.message;

    })

    builder.addCase(updateFolderSlice.pending, (state) => {
    })
    builder.addCase(updateFolderSlice.fulfilled, (state, { payload }) => {
      state.FolderData.loading = false;
      console.log("I am in fulfilled state");

      const index = state.FolderData.data.findIndex((item) => item._id === payload.data._id);

      if (index !== -1) {

        state.FolderData.data = state.FolderData.data.map((value, i) => {
          if (value.checked) {
            value.checked = false;
          }

          if (i === index) {
            return payload.data;
          }
          return value;
        });
      }

      console.log(index);
    });

    builder.addCase(updateFolderSlice.rejected, (state, { payload }) => {
      state.FolderData.loading = false;
      state.FolderData.data = null;
      state.FolderData.error.error = true;
      state.FolderData.error.message = payload;

    })
    builder.addCase(deleteFolderSlice.fulfilled, (state, { payload }) => {
      console.log(payload);
      state.loading = false;
      const { _id } = payload.data;
      const index = state.FolderData.data.findIndex((item) => item._id === _id);
      state.FolderData.data.splice(index, 1);

    })
    builder.addCase(deleteFolderSlice.rejected, (state, { payload }) => {

      state.loading = false;
      state.FolderData.data = null;
      state.FolderData.error.error = true;
      state.FolderData.error.message = payload;
    })

    builder.addCase(getCreditSlice.pending,(state)=>{
      state.Credit.loading=true;
    })
    builder.addCase(getCreditSlice.fulfilled,(state,{payload})=>{
      state.Credit.loading=false;
      state.Credit.data.plan=payload.plan;
      state.Credit.data.points=payload.points
    })
    builder.addCase(getCreditSlice.rejected,(state,{payload})=>{
      state.Credit.loading=false;
      state.Credit.error.status=false;
      state.Credit.error.message=payload;
    })
   
    builder.addCase(renameFolderSlice.fulfilled,(state,{payload})=>{
      const { _id } = payload.data;
      console.log("This is payload for renameFolderSlcie");
      console.log(payload);
      const index = state.FolderData.data.findIndex((item) => item._id === _id);

      console.log("FOLDER DATA");
      console.log(state.FolderData.data);
      console.log("INDEX of folder = "+index);



      state.FolderData.data[index].FolderName=payload.data.FolderName;

      
    })
    builder.addCase(renameFolderSlice.rejected,(state,{payload})=>{
      state.FolderData.error.error=true
      state.FolderData.error.message=payload?.message || "Rename time folder something went wrong"

      
    })









  },
});
export const { addEmailVerifier,updateCredits } = emailVerifierSlice.actions;
export default emailVerifierSlice.reducer;
