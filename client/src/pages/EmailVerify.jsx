import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Api1, Api3, Api2 } from '../features/api/Api';
import { useDispatch } from 'react-redux';
import { addUserData } from "../features/slice/userSlice";
const EmailVerify = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        if (id) {
            localStorage.removeItem("user");

            Api1(`/api/v1/user/emailVerify/${id}`).then(({ data }) => {
                dispatch(addUserData({
                    data: {
                        refreshToken: data["refreshToken"],
                        token: data["token"],
                        userId: data["userId"]
                    }
                }))
                return true
            }).then(() => {
                setTimeout(()=>{
                    location.href="/dashboard"

                },[2000])

            }).catch((err) => {
                localStorage.removeItem("user");

                alert("ALREADY VERIFIED ACCOUNT !!!!");
                console.log(err);

            })


        }
    }, [id])


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center">

                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Email Verified</h2>
                    <p className="text-gray-600 mt-2">Your email address has been successfully verified.</p>
                </div>
              
            </div>
        </div>
    );
};

export default EmailVerify;
