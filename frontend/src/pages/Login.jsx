import React, { useState } from 'react';
import { login } from '../api/api';

function Login() {
    const [formData, setFormData] = useState({
        usertype: 'superadmin',
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});

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

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (validateForm()) {
            const data= await login(formData.email,formData.password)
            if(data){
                console.log(data);
                
            }
            else{
                console.log('err');
                
            }

        } else {
            console.log('Form has errors. Please fix them.');
        }
    };

    return (
        <div className='mt-10 flex justify-center'>
            <div className='w-2/4 shadow-2xl rounded-3xl overflow-hidden'>
                <div className='flex justify-center bg-lime-200'>
                    <h3 className='p-5 tracking-widest text-2xl'>
                        Login <i className="ri-login-circle-line"></i>
                    </h3>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className='flex justify-center gap-14 py-5 text-[1.2vw]'>
                        {['superadmin', 'admin', 'user'].map((type) => (
                            <label key={type}>
                                <input
                                    type='radio'
                                    name='usertype'
                                    value={type}
                                    checked={formData.usertype === type}
                                    onChange={handleChange}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                        ))}
                    </div>

                    <div className='flex items-center flex-col'>
                        <div className='w-8/12 my-5'>
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
                        >
                            Login <i className="ps-3 pe-5 ri-arrow-right-long-line"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}


export default Login;
