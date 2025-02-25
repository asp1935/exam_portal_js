import React from 'react'
import { useSelector } from 'react-redux'
import { user } from '../redux/slice/userSlice'
import { Navigate, Outlet } from 'react-router';

function GuestRoute() {

    const loggedInUser=useSelector(user);
    return loggedInUser?<Navigate to='/dashboard' replace/>:<Outlet/>
}

export default GuestRoute
