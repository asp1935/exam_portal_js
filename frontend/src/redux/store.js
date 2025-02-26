import {configureStore} from '@reduxjs/toolkit';
import UserSlice from './slice/UserSlice';
import ToastSlice from './slice/ToastSlice';

const store=configureStore({
    reducer:{
        userReducer:UserSlice,
        toastReducer:ToastSlice
    }
})

export default store;