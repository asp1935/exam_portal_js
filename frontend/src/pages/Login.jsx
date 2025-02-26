import React, { useState } from 'react';
import { login } from '../api/api';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/slice/UserSlice';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { showToast } from '../redux/slice/ToastSlice';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathName || '/';
    // useMutation for login
    const { mutate, isLoading, isSuccess, isError, error } = useMutation({
        mutationFn: ({ email, password }) => login(email, password),
        onSuccess: (response) => {
            if (response?.data) {
                dispatch(setUserData(response.data)); // Store user data in Redux
                dispatch(showToast({ message: `Logged In Successfully...`, type: 'success' }))
                navigate(from, { replace: true });
            }
        },
        onError: (error) => {
            dispatch(showToast({ message: error, type: 'success' }))
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });

        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            mutate({ email: formData.email, password: formData.password })
        }
        else {
            console.log('err');

        }

    }



    return (
        <div className='mt-10 flex justify-center'>
            <div className='w-2/4 shadow-2xl rounded-3xl overflow-hidden'>
                <div className='flex justify-center bg-lime-200'>
                    <h3 className='p-5 tracking-widest text-2xl'>
                        Login <i className="ri-login-circle-line"></i>
                    </h3>
                </div>

                <form onSubmit={handleSubmit} >
                    <div className='flex items-center flex-col mt-6 mb-5'>
                        <div className='w-8/12 '>
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Enter Email...'
                                className='w-full outline-0 border-b pl-2 py-1 text-[1.3vw]'
                                required
                            />
                            {errors.email && (
                                <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                            )}
                        </div>

                        <div className='w-8/12 my-4'>
                            <input
                                type='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                placeholder='Enter Password...'
                                className='w-full outline-0 border-b pl-2 py-1 text-[1.3vw]'
                                required
                            />
                            {errors.password && (
                                <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className='flex justify-center my-10'>
                        <button
                            type='submit'
                            className='border ps-10 py-1 rounded-3xl text-[1.3vw] bg-sky-500 hover:bg-sky-600 text-white outline-0 cursor-pointer'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging In' : 'Login '} <i className="ps-3 pe-5 ri-arrow-right-long-line"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}


export default Login;
