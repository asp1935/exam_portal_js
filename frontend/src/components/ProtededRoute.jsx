import React from 'react'
import { useSelector } from 'react-redux'
import { user } from '../redux/slice/userSlice'
import { Navigate, Outlet } from 'react-router';
import PropTypes from 'prop-types';

function ProtededRoute({ allowedRoles }) {
    const currectUser = useSelector(user);
    if (!currectUser) {
        return <Navigate to="/login" replace />
    }
    if (allowedRoles && !allowedRoles.includes(currectUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

ProtededRoute.propTypes={
    allowedRoles:PropTypes.element.isRequired
}


export default ProtededRoute
