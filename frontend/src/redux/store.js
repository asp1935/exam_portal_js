import {configureStore} from '@reduxjs/toolkit';
import UserSlice from './slice/UserSlice';
const store=configureStore({
    reducer:{
        userReducer:UserSlice
    }
})

export default store;