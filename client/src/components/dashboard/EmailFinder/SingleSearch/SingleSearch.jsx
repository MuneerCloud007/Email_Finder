import React, { useContext, useState } from 'react';
import { Button, Input, Typography } from '@material-tailwind/react';
import axios from 'axios';
import * as Yup from 'yup';
import { Api1, Api2 } from "../../../../features/api/Api";
import socketContextApi from '../../../../contextApi/SocketContextApi';


const validateDomain = (domain) => {
    const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}$/;
    return domainPattern.test(domain);
};

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    domain: Yup.string(),
    companyName: Yup.string(),
}).test(
    'domain-or-companyName',
    function (value) {
        const { domain, companyName } = value;
        if (!domain && !companyName) {
            return this.createError({
                path: 'domain',
                message: 'Domain or Company Name is required',
            });
        }
        if(domain?.length >0 &&companyName?.length == 0 &&!validateDomain(domain)){
            console.log("validate the domain");
            console.log(domain);
            return this.createError({
                path: 'domain',
                message: 'Domain you provided does not exists',
            });

        }

    }
);

const SingleSearch = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        domain: '',
        companyName: ''
    });
    const { socket } = useContext(socketContextApi);
  
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log("handle change is here pls check");
        console.log({ name, value });
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" })


    };

    const validateForm = () => {
        try {
            validationSchema.validateSync(formData, { abortEarly: false });
            setFormData({});
            return true;
        } catch (error) {
            const validationErrors = {};
            error.inner.forEach(err => {
                if (err.path.length > 0) {
                    validationErrors[err.path] = err.message;
                }
            });
            if(Object.keys(validationErrors).length==0){
                return true;
            }
            console.log("validation errors for here pls check!!!");
            console.log(validationErrors)
            setErrors(validationErrors);
            return false;
        }
    };



    const onSubmitEmailFind = async (e) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            e.preventDefault();
            if (!validateForm()  ) {
                throw Error("Validation Failed")

            }
            setErrors({});
            const data = { ...formData, user: user["userId"], socket: socket["id"] }
            Api1(
                "/api/v1/single/search/finder",
                "post",
                data
            ).then((data) => {
                setFormData({
                    firstName:"",
                    lastName:"",
                    domain:"",
                    companyName:""
    
                });
            }).catch((err) => {
                console.log(err);
            })


        }
        catch (err) {
            console.log(err);

        }
    }
    const onSubmitEmailVerify = async (e) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            e.preventDefault();
            if ( !validateForm()) {
                if(validationChecker){
                throw Error("Validation Failed")
                }
                

            }

            setErrors({});
            const data = { ...formData, user: user["userId"], socket: socket["id"] }
          
            
            Api1(
                "/api/v1/single/search/verification",
                "post",
                data
            ).then((data) => {
                setFormData({
                    firstName:"",
                    lastName:"",
                    domain:"",
                    companyName:""
    
                });
            }).catch((err) => {
                console.log(err);
            })


        }
        catch (err) {
            console.log(err);

        }
    }

    return (
        <div className="container mx-auto p-4 flex flex-col justify-between  gap-6  w-[80%] ">
            <div>
                <Typography variant="h3">Single Search</Typography>

            </div>

            <form >
                <div className="mb-4">
                    <Input
                        type="text"
                        name="firstName"
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div className="mb-4">
                    <Input
                        type="text"
                        name="lastName"
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
                <div className="mb-4">
                    <Input
                        type="text"
                        name="domain"
                        label="Domain"
                        value={formData.domain}
                        onChange={handleChange}
                        error={errors.domain}
                    />
                    {errors.domain && <p className="text-red-500 text-sm">{errors.domain}</p>}
                </div>
                <div className="mb-4">
                    <Input
                        type="text"
                        name="companyName"
                        label="Company Name"
                        value={formData.companyName}
                        onChange={handleChange}
                        error={errors.companyName}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                </div>
                <div className=' flex justify-center gap-4 mt-5'>
                    <Button color='green'
                        onClick={onSubmitEmailFind}
                    >Find Email</Button>
                    <Button className="ml-2" color='blue' onClick={onSubmitEmailVerify}>Find And Verify Email</Button>
                </div>
            </form>
        </div>
    );
};

export default SingleSearch;
