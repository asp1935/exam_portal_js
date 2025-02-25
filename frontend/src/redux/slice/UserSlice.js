import { createSlice } from "@reduxjs/toolkit";

const UserSlice=createSlice({
    name:'userReducer',
    initialState:{
        user:null,
    },
    reducers:{
        setUserData:(state,action)=>{
            state.user=action.payload;
        },
    }
});

export const {setUserData}=UserSlice.actions;
export const user=(state)=>state.userReducer.user;
export default UserSlice.reducer;   