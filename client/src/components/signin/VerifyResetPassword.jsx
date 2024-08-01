import React, { useState } from 'react';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Api1 } from '../../features/api/Api';

// Define validation schema for the form
const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function ForgotPassword() {
  const [data, setData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errorRegister, setErrorRegister] = useState({});
  const navigate = useNavigate();
  const {id}=useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    // Clear specific field errors
    if (errorRegister[name]) {
      setErrorRegister({ ...errorRegister, [name]: '' });
    }
  };

  const handleSubmit = async () => {
    const vl = { ...data };

    try {
      await validationSchema.validate(vl, { abortEarly: false });

      // Send API request to reset password
      console.log("I am in reset verift page");
      console.log(vl);
      Api1(`/api/v1/user/verify/forgotpassword/${id}`, 'put', {
        password:vl["newPassword"]
      })
        .then(() => {
            setData(
                {
                    newPassword: '',
                    confirmPassword: '',
                  }
            )
          toast.success('Password reset request sent successfully.');
          setTimeout(()=>{
            navigate('/'); // Redirect to login page after success

          },[4000])
        })
        .catch((err) => {
          console.error(err);
          const message = err.response?.data?.message || 'Error occurred';
          toast.error(message);
        });

    Api1(`/api/v1/user/verify/forgotpassword/${id}`,'put',{
        password:vl["newPassword"]
    })
    .then(({success,data})=>{
        if(success){
            toast.success('Password reset request sent successfully.');
            setTimeout(()=>{
            location.href="/";
            },[3000])
        }


    }).catch((err)=>{

        console.log(err);
    })
} 
    
    catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrorRegister(newErrors);
    }
  
}

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
              {/* SVG path */}
            </svg>
          </div>
          <h2 className="text-center text-2xl font-bold leading-tight text-black">
            Reset Password
          </h2>

          <form action="#" method="POST" className="mt-8">
            <div className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="text-base font-medium text-gray-900">
                  New Password
                </label>
                <div className="mt-2">
                  <input
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="password"
                    placeholder="New Password"
                    value={data.newPassword}
                    name="newPassword"
                    onChange={handleChange}
                  />
                  {errorRegister.newPassword && (
                    <p className='text-red-500'>{errorRegister.newPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-base font-medium text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="password"
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    name="confirmPassword"
                    onChange={handleChange}
                  />
                  {errorRegister.confirmPassword && (
                    <p className='text-red-500'>{errorRegister.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                  onClick={handleSubmit}
                >
                  Reset Password <ArrowRight className="ml-2" size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
