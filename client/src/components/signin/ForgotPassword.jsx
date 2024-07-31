import React, { useContext, useEffect, useState } from 'react'
import * as Yup from "yup";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {Api1} from "../../features/api/Api";



function ForgotPassword() {
    const [data, setData] = useState({
        email: "",
        oldpassword: "",
        newpassword: ""
    });


    const navigate = useNavigate();
    const [errorRegiser, setErrorRegister] = useState({

    });
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = (email) => emailRegex.test(email);


    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required')
        ,

        oldpassword: Yup.string()
            .required('Old Password is required')
            .min(1, 'Old Password is required'),

        newpassword: Yup.string()
            .required('New Password is required')
            .min(1, 'New Password is required')
    });

    return (
        <section className="overflow-auto no-scroll-bar">
            <ToastContainer />

            <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
                <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
                    <div className="mb-2 flex justify-center">
                        <svg
                            width="50"
                            height="56"
                            viewBox="0 0 50 56"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M23.2732 0.2528C20.8078 1.18964 2.12023 12.2346 1.08477 13.3686C0 14.552 0 14.7493 0 27.7665C0 39.6496 0.0986153 41.1289 0.83823 42.0164C2.12023 43.5449 23.2239 55.4774 24.6538 55.5267C25.9358 55.576 46.1027 44.3832 48.2229 42.4602C49.3077 41.474 49.3077 41.3261 49.3077 27.8158C49.3077 14.3055 49.3077 14.1576 48.2229 13.1714C46.6451 11.7415 27.1192 0.450027 25.64 0.104874C24.9497 -0.0923538 23.9142 0.00625992 23.2732 0.2528ZM20.2161 21.8989C20.2161 22.4906 18.9835 23.8219 17.0111 25.3997C15.2361 26.7803 13.8061 27.9637 13.8061 28.0623C13.8061 28.1116 15.2361 29.0978 16.9618 30.2319C18.6876 31.3659 20.2655 32.6479 20.4134 33.0917C20.8078 34.0286 19.871 35.2119 18.8355 35.2119C17.8001 35.2119 9.0233 29.3936 8.67815 28.5061C8.333 27.6186 9.36846 26.5338 14.3485 22.885C17.6521 20.4196 18.4904 20.0252 19.2793 20.4196C19.7724 20.7155 20.2161 21.3565 20.2161 21.8989ZM25.6893 27.6679C23.4211 34.9161 23.0267 35.7543 22.1391 34.8668C21.7447 34.4723 22.1391 32.6479 23.6677 27.9637C26.2317 20.321 26.5275 19.6307 27.2671 20.3703C27.6123 20.7155 27.1685 22.7864 25.6893 27.6679ZM36.0932 23.2302C40.6788 26.2379 41.3198 27.0269 40.3337 28.1609C39.1503 29.5909 31.6555 35.2119 30.9159 35.2119C29.9298 35.2119 28.9436 33.8806 29.2394 33.0424C29.3874 32.6479 30.9652 31.218 32.7403 29.8867L35.9946 27.4706L32.5431 25.1532C30.6201 23.9205 29.0915 22.7371 29.0915 22.5892C29.0915 21.7509 30.2256 20.4196 30.9159 20.4196C31.3597 20.4196 33.6771 21.7016 36.0932 23.2302Z"
                                fill="black"
                            />
                        </svg>
                    </div>
                    <h2 className="text-center text-2xl font-bold leading-tight text-black">
                        Forgot Password
                    </h2>

                    <form action="#" method="POST" className="mt-8">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="" className="text-base font-medium text-gray-900">
                                    {' '}
                                    Email{' '}
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="email"
                                        placeholder="Email"
                                        value={data["email"]}
                                        name={"email"}
                                        onChange={(e) => {
                                            setData({ ...data, ["email"]: e.target.value })
                                            if (isValidEmail(e.target.value)) {
                                                setErrorRegister({ ...errorRegiser, email: '' })
                                            }
                                        }}

                                    ></input>
                                    {errorRegiser.email && <p className=' text-red-500'>{errorRegiser.email}</p>}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="" className="text-base font-medium text-gray-900">
                                        {' '}
                                        Old Password{' '}
                                    </label>

                                </div>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="password"
                                        placeholder="old password"
                                        value={data["oldpassword"]}
                                        name={"oldpassword"}
                                        onChange={(e) => {
                                            setData({ ...data, ["oldpassword"]: e.target.value })
                                            setErrorRegister({ ...errorRegiser, oldpassword: '' })

                                        }}
                                    ></input>
                                    {errorRegiser.oldpassword && <p className=' text-red-500'>{errorRegiser.oldpassword}</p>}

                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="" className="text-base font-medium text-gray-900">
                                        {' '}
                                        New Password{' '}
                                    </label>

                                </div>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="password"
                                        placeholder="new password"
                                        value={data["newpassword"]}
                                        name={"newpassword"}
                                        onChange={(e) => {
                                            setData({ ...data, ["newpassword"]: e.target.value })
                                            setErrorRegister({ ...errorRegiser, newpassword: '' })

                                        }}
                                    ></input>
                                    {errorRegiser.newpassword && <p className=' text-red-500'>{errorRegiser.newpassword}</p>}

                                </div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                    onClick={async () => {

                                        const vl = {
                                            email: data["email"],
                                            oldpassword:data["oldpassword"],
                                            newpassword: data["newpassword"],
                                        }

                                        console.log("Error login data");
                                        console.log(vl);

                                        try {
                                            await validationSchema.validate(vl, { abortEarly: false });


                                            console.log("I am inside in login bar");

                                            console.log(vl);
                                            Api1("/api/v1/user/forgotpassword","put",{...vl})
                                            .then((data)=>{
                                                toast.success("Password is reset");

                                                setTimeout(()=>{

                                                    navigate("/");

                                                },[5000])
                                            })
                                           .catch((err)=>{
                                                console.log(err);
                                                const message=err.response.data.message || "Not found";
                                                toast.error(message);

                                                

                                            })
                                           

                                        }
                                        catch (error) {

                                            const newErrors = {};

                                            console.log(error.inner);

                                            error.inner.forEach((err) => {

                                                newErrors[err.path] = err.message;
                                            });
                                            console.log("New error !!!!");
                                            console.log(newErrors);

                                            setErrorRegister(newErrors);

                                        }







                                    }}
                                >
                                    Forgot Password <ArrowRight className="ml-2" size={16} />
                                </button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </section>
    );
}

export default ForgotPassword