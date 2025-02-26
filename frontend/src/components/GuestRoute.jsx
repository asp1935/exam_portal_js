import React from 'react'
import { useSelector } from 'react-redux'

import { Navigate, Outlet } from 'react-router';
import { user } from '../redux/slice/UserSlice';

function GuestRoute() {

    const loggedInUser=useSelector(user);
    
    return loggedInUser?<Navigate to='/dashboard' replace/>:<Outlet/>
}

export default GuestRoute
