import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { user } from '../redux/slice/UserSlice'
import { Navigate, Outlet } from 'react-router';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { showToast } from '../redux/slice/ToastSlice';

function ProtededRoute({ allowedRoles }) {
    const currectUser = useSelector(user);
    const dispatch = useDispatch();
    if (!currectUser) {
        return <Navigate to="/login" replace />
    }
    if (allowedRoles && !allowedRoles.includes(currectUser.role)) {
        dispatch(showToast({ message: `Unauthorized Access!!!`, type: 'warn' }))

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

ProtededRoute.propTypes = {
    allowedRoles: PropTypes.element.isRequired
}


export default ProtededRoute
