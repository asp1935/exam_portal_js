import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { user } from '../redux/slice/UserSlice';
import { Navigate, Outlet } from 'react-router';
import PropTypes from 'prop-types';
import { showToast } from '../redux/slice/ToastSlice';

function ProtededRoute({ allowedRoles }) {
    const currectUser = useSelector(user);
    const dispatch = useDispatch();
    const [redirectPath, setRedirectPath] = useState(null);

    useEffect(() => {
        if (!currectUser) {
            
            setRedirectPath("/login");
        } else if (allowedRoles && !allowedRoles.includes(currectUser.role)) {
            dispatch(showToast({ message: `Unauthorized Access!!!`, type: 'warn' }));
            setRedirectPath("/");
        }
    }, [currectUser, allowedRoles, dispatch]);

    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
}

ProtededRoute.propTypes = {
    allowedRoles: PropTypes.array,
};

export default ProtededRoute;
