import React, { useState, useCallback, useEffect, useContext, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import "./BulkSearch.css";
import {
    Dialog, DialogBody, DialogFooter, DialogHeader, Button, Typography, Card,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from '@material-tailwind/react';
import { FaRegCheckCircle } from "react-icons/fa";
import Select from 'react-select';
import { Collapse } from 'react-collapse';
import * as Yup from 'yup';
import Table2 from '../Table/Table2';
import { sampleData, headers } from './Sampledata';
import { Api1, Api2, Api3 } from "../../../features/api/Api";
import socketContextApi from '../../../contextApi/SocketContextApi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaFile } from 'react-icons/fa'; // Import the desired icon from react-icons
import downloadData from './DownloadData';

import {
    PresentationChartBarIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    InboxIcon,
    PowerIcon,
    MagnifyingGlassIcon,
    CheckIcon

} from "@heroicons/react/24/solid";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import countryList from 'react-select-country-list'
import { onMouseLeaveReduce, onMouseOverReduce } from "../../../features/slice/fileSlice"



import { getAllFileSlice } from "../../../features/slice/fileSlice";

const WrapperTable = () => {
    const dispatch = useDispatch();
    const user = JSON.parse(localStorage.getItem("user"));
    const { loading, data, error } = useSelector((state) => state.file.FileData);
    const [rowData, setRowData] = useState([]);
    const gridRef = useRef();

    const onMouseOverRow = (vl) => {
        console.log("MOuse over value is here!");
        console.log(vl["data"])
        dispatch(onMouseOverReduce(vl["data"]));


    }
    const onMouseLeaveRow = (vl) => {
        console.log("ONMOUSE LEAVE IS HERE");
        dispatch(onMouseLeaveReduce());
    }

    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: 'File Name', field: 'file_name',

            cellRenderer: (params) => {
                console.log("/file/${params}");
                console.log(params);
                if (params.data["status"] == "pending") {
                    return (
                        <>
                            {params.value}
                        </>
                    )

                }
                else {
                    return (<Link to={`/file/${params.data["_id"]}`} className=' text-blue-600'>
                        {params.value}
                    </Link>)
                }

            }

        },
        { headerName: 'Total Data', field: 'totalData' },
        { headerName: 'Found', field: 'totalValid' },
        { headerName: 'Status', field: 'status' },
        { headerName: 'Enrichment', field: 'enrichment' },

        {
            headerName: 'Operational', field: "operational", cellRenderer: (params) => {
                console.log("/file/${params}");
                const { mouseOverId } = useSelector((state) => state.file)
                console.log("PARAMS VALUE IS HERE = ");
                console.log(params["data"]["operational"]);
                console.log("After params below")
                if (mouseOverId && mouseOverId["_id"] == params["data"]["_id"]) {
                    return (
                        <button onClick={() => {
                            if (params.data["status"] == "pending") {
                                return <>
                                    <span>Loading</span>
                                </>

                            }
                            else {
                                handleDownload(params.data["_id"],params["data"]["operational"])
                            }

                        }} className={`${params.data["status"] == "pending" ? 'text-gray-600' : ' text-blue-700'}`}>


                            {(params.data["status"] == "pending") ? "Loading" : "Download"}
                        </button>
                    )

                }
                else {
                    return (<Link >
                        {params.value}
                    </Link>)
                }

            }
        },

    ]);

    const handleDownload = (fileId,operational) => {
        // Implement the download functionality here
        console.log("Download file with ID:", fileId);
        console.log("EMail operational is here pls check = "+operational);
        const user = JSON.parse(localStorage.getItem("user"));

        Api3({
            method: "post", url: "/api/v1/file/download/File", data: {
                "fileId": fileId,
                "userId": user["userId"],
                operational:operational
            }
        }).then((data) => data.data).then(async (response) => {
            console.log("Api3 response !!!");
            console.log(response)
            const blob = response;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'file.xlsx'; // You can dynamically set the file name
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);


        }).catch((err) => {
            console.log(err);
        })




    };

    useEffect(() => {
        dispatch(getAllFileSlice({ method: "get", url: `/api/v1/file/getAllFile/${user["userId"]}` }));

    }, [])




    return (
        <Table2
            user={user}
            rowData={data}
            setRowData={setRowData}
            columnDefs={columnDefs}
            setColumnDefs={setColumnDefs}
            isLoading={loading}
            gridRef={gridRef}
            onMouseOverRow={onMouseOverRow}
            onMouseLeaveRow={onMouseLeaveRow}
        />
    );
};


const InsufficientCreditModal = ({ isOpen, handleClose }) => {
    return (
        <Dialog open={isOpen} handler={handleClose}>
            <DialogHeader>Insufficient Credits</DialogHeader>
            <DialogBody>
                <p>You do not have enough credits to perform this action. Please purchase more credits to continue.</p>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="gradient" color="blue" onClick={() => alert('Redirect to purchase page')}>
                    Buy Credits
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

const InvalidFileTypeModal = ({ isOpen, handleClose }) => {
    return (
        <Dialog open={isOpen} handler={handleClose}>
            <DialogHeader>Invalid File Type</DialogHeader>
            <DialogBody>
                <p>Please upload a valid .xls or .csv file.</p>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    );
};




const SampleModal = ({
    isOpen,
    handleDialogClose,
    file,
    selectOpen,
    setFileModalData,
    FileModalData,
    handleSelectOpen, schemaError,
    columns,
    errors,
    handleOptionChange,
    onResetModal,
    setOpen,
    firstNameColumn,
    fullNameColumn,
    lastNameColumn,
    companyNameColumn,
    WebsiteColumn,
    countryStateColumn,


    handleSubmit
}) => {
    const [collapseOpen, setCollapseOpen] = useState({
        one: true,
        two: true,
        three: true
    });



    const formattedCountries = countryList().getData().map(country => ({
        value: country.value, // or country.alpha2Code if using Alpha-2 code
        label: country.label,
    }));

    const SelectFormData = columns.map((vl) => {
        return { value: vl, label: vl }
    })


    const changeCountryHandler = value => {
        setCountryValue(value);
    };

    const toggleCollapse = (index) => {
        console.log("toggleCollapse = " + index);
        const valuesCollapseOpen = Object.values(collapseOpen)
        const dumpCollapase = { ...collapseOpen };
        console.log(valuesCollapseOpen);
        const keyCollapseOpen = Object.keys(collapseOpen);
        dumpCollapase[keyCollapseOpen[index - 1]] = !valuesCollapseOpen[index - 1]
        setCollapseOpen({
            ...dumpCollapase
        })
    };




 

    const [errorModal, setErrorModal] = useState({});



    return (
        <Dialog open={isOpen} onClose={handleDialogClose} size={"xl"} className=' overflow-auto h-[90vh] no-scroll-bar'>
            <div className="grid grid-cols-1 divide-y w-full p-3">
                <DialogHeader>
                    <div className=' flex flex-col'>
                        <div className=' flex gap-2 items-center my-3'>
                            <Chip variant="outlined" value="File" color='blue' />
                            <h1>
                                {file ? file.name : 'No file selected'}
                            </h1>
                            <Chip variant="outlined" value="In complete" color='gray' className=' ml-auto' />



                        </div>

                        <p className=' mt-2 text-gray-500 text-sm font-normal'>We were not able to detect the mandatory column names. Choose the correct column for each information. Should you need help, don't hesitate to visit the Help Center.
                        </p>

                    </div>

                </DialogHeader>
                <DialogBody>

                    <div className="space-y-4">
                        <div>
                            <List>
                                <div className="">
                                    <Button
                                        className="w-full text-left flex items-center justify-between py-3 bg-gray-100"
                                        onClick={() => toggleCollapse(1)}
                                    >
                                        <div className="flex items-center">
                                            <FaRegCheckCircle className="h-5 w-5" />
                                            <Typography color="blue-gray" className="ml-2">
                                                Personal Information
                                            </Typography>
                                        </div>
                                        <ChevronDownIcon
                                            strokeWidth={2.5}
                                            className={`h-4 w-4 transition-transform ${collapseOpen["one"] ? "rotate-180" : ""}`}
                                        />
                                    </Button>
                                    <Collapse isOpened={collapseOpen["one"]} className="p-3">
                                        <List className="pl-4">
                                            <div className='w-[40%]'>
                                                <Typography variant="h6">Full Name</Typography>
                                                <Select
                                                    value={fullNameColumn}
                                                    name='fullName'
                                                    onChange={(e) => handleOptionChange('fullName', e)}
                                                    options={SelectFormData}
                                                    styles={{
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            maxHeight: '30vh',
                                                            overflowY: 'auto',
                                                            position: 'absolute',
                                                        }),
                                                        menuList: (provided) => ({
                                                            ...provided,
                                                            maxHeight: '30vh',
                                                            overflowY: 'scroll',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            height: 'auto',
                                                        }),
                                                    }}
                                                    menuPlacement="top"
                                                    classNamePrefix="custom-scrollbar"
                                                />
                                                {errorModal.fullName && (
                                                    <Typography color="red" variant="small">
                                                        {errorModal.fullName}
                                                    </Typography>
                                                )}
                                            </div>
                                            <div className='w-[90%] grid grid-cols-2 gap-3'>
                                                <div className="firstName">
                                                    <Typography variant="h6">First Name</Typography>
                                                    <Select
                                                        value={firstNameColumn}
                                                        onChange={(e) => handleOptionChange('firstName', e)}
                                                        options={SelectFormData}
                                                        styles={{
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'auto',
                                                                position: 'absolute',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'scroll',
                                                            }),
                                                            option: (provided) => ({
                                                                ...provided,
                                                                height: 'auto',
                                                            }),
                                                        }}
                                                        menuPlacement="top"
                                                        classNamePrefix="custom-scrollbar"
                                                    />
                                                    {errorModal.firstName && (
                                                        <Typography color="red" variant="small">
                                                            {errorModal.firstName}
                                                        </Typography>
                                                    )}
                                                </div>
                                                <div className="lastName">
                                                    <Typography variant="h6">Last Name</Typography>
                                                    <Select
                                                        value={lastNameColumn}
                                                        onChange={(e) => handleOptionChange('lastName', e)}
                                                        options={SelectFormData}
                                                        name={"lastName"}
                                                        styles={{
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'auto',
                                                                position: 'absolute',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'scroll',
                                                            }),
                                                            option: (provided) => ({
                                                                ...provided,
                                                                height: 'auto',
                                                            }),
                                                        }}
                                                        menuPlacement="top"
                                                        classNamePrefix="custom-scrollbar"
                                                    />

                                                    {errorModal.lastName && (
                                                        <Typography color="red" variant="small">
                                                            {errorModal.lastName}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                        </List>
                                    </Collapse>
                                </div>

                                <div className=" my-5">
                                    <Button
                                        className="w-full text-left flex items-center justify-between py-3 bg-gray-100"
                                        onClick={() => toggleCollapse(2)}
                                    >
                                        <div className="flex items-center">
                                            <FaRegCheckCircle className="h-5 w-5 text-gray-700" />
                                            <Typography color="blue-gray" className="ml-2">
                                                Company Information
                                            </Typography>
                                        </div>
                                        <ChevronDownIcon
                                            strokeWidth={2.5}
                                            className={`h-4 w-4 transition-transform ${collapseOpen["two"] ? "rotate-180" : ""}`}
                                        />
                                    </Button>
                                    <Collapse isOpened={collapseOpen["two"]} className="p-3">
                                        <List className="pl-4">
                                            <div className='w-[90%] grid grid-cols-2 gap-3 justify-center items-center'>
                                                <div className="countryWebsite">
                                                    <Typography variant="h6">Companies websites (+20% more emails)</Typography>
                                                    <Select
                                                        value={WebsiteColumn}
                                                        name='companyWebsite'
                                                        onChange={(e) => handleOptionChange('companyWebsite', e)}
                                                        options={SelectFormData}
                                                        styles={{
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'auto',
                                                                position: 'absolute',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'scroll',
                                                            }),
                                                            option: (provided) => ({
                                                                ...provided,
                                                                height: 'auto',
                                                            }),
                                                        }}
                                                        menuPlacement="top"
                                                        classNamePrefix="custom-scrollbar"
                                                    />
                                                    {errorModal.companyWebsite && (
                                                        <Typography color="red" variant="small">
                                                            {errorModal.companyWebsite}
                                                        </Typography>
                                                    )}
                                                </div>
                                                <div className="companyName">
                                                    <Typography variant="h6">Companies names</Typography>
                                                    <Select
                                                        value={companyNameColumn}
                                                        name='companyName'
                                                        onChange={(e) => handleOptionChange('companyName', e)}
                                                        options={SelectFormData}
                                                        styles={{
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'auto',
                                                                position: 'absolute',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '30vh',
                                                                overflowY: 'scroll',
                                                            }),
                                                            option: (provided) => ({
                                                                ...provided,
                                                                height: 'auto',
                                                            }),
                                                        }}
                                                        menuPlacement="top"
                                                        classNamePrefix="custom-scrollbar"
                                                    />
                                                    {errorModal.companyName && (
                                                        <Typography color="red" variant="small">
                                                            {errorModal.companyName}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                        </List>
                                    </Collapse>
                                </div>

                                <div className=" my-5">
                                    <Button
                                        className="w-full text-left flex items-center justify-between py-3 bg-gray-100"
                                        onClick={() => toggleCollapse(3)}
                                    >
                                        <div className="flex items-center">
                                            <FaRegCheckCircle className="h-5 w-5" />
                                            <Typography color="blue-gray" className="ml-2">
                                                Country
                                            </Typography>
                                        </div>
                                        <ChevronDownIcon
                                            strokeWidth={2.5}
                                            className={`h-4 w-4 transition-transform ${collapseOpen["three"] ? "rotate-180" : ""}`}
                                        />
                                    </Button>
                                    <Collapse isOpened={collapseOpen["three"]} className="p-3">
                                        <List className="pl-4">
                                            <div className="flex flex-col  country">
                                                <Typography variant="h6">Country names</Typography>
                                                <Select
                                                    value={countryStateColumn}
                                                    name="country"
                                                    onChange={(e) => handleOptionChange('country', e)}
                                                    options={formattedCountries}
                                                    defaultValue={{label:"India",value:"In"}}
                                                    styles={{
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            maxHeight: '30vh',
                                                            overflowY: 'auto',
                                                            position: 'absolute',
                                                        }),
                                                        menuList: (provided) => ({
                                                            ...provided,
                                                            maxHeight: '30vh',
                                                            overflowY: 'scroll',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            height: 'auto',
                                                        }),
                                                    }}
                                                    menuPlacement="top"
                                                    classNamePrefix="custom-scrollbar"
                                                />
                                                {errorModal.country && (
                                                    <Typography color="red" variant="small">
                                                        {errorModal.country}
                                                    </Typography>
                                                )}
                                            </div>
                                        </List>
                                    </Collapse>
                                </div>
                            </List>
                        </div>
                    </div>
                </DialogBody>


                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => {
                        setOpen(false)}} className="mr-1">
                        Cancel
                    </Button>
                  
                    <Button variant="text" color="blue" onClick={async () => {
                        try {
                            const formData = {
                                fullName: fullNameColumn ? fullNameColumn["value"] : null,
                                firstName: firstNameColumn ? firstNameColumn["value"] : null,
                                lastName: lastNameColumn ? lastNameColumn["value"] : null,
                                companyName: companyNameColumn ? companyNameColumn["value"] : null,
                                companyWebsite: WebsiteColumn ? WebsiteColumn["value"] : null,
                                country: countryStateColumn ? countryStateColumn["value"] : null
                            }
                            await schemaError.validate(formData, { abortEarly: false });
                            setErrorModal({});
                            handleSubmit()
                        }
                        catch (err) {
                            const newErrors = {};
                            console.log(err);
                            err.inner.forEach((err) => {
                                newErrors[err.path] = err.message;
                            });
                            setErrorModal(newErrors);
                        }
                    }}>
                        Submit
                    </Button>
                    <Button variant="text" color="gray" onClick={() => {
                        setErrorModal({})

                        onResetModal();
                    }}>
                        Reset
                    </Button>
               
                </DialogFooter>
            </div>
        </Dialog>
    );
};



//FIle Upload this is For Bulk Data.....



const FileUploadComponent = () => {
    const [open, setOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [file, setFile] = useState(null);


    //Select data is here 
    const [fullNameColumn, setFullNameColumn] = useState('');
    const [firstNameColumn, setFirstNameColumn] = useState('');
    const [lastNameColumn, setLastNameColumn] = useState('');
    const [companyNameColumn, setCompanyNameColumn] = useState('');
    const [WebsiteColumn, setWebsiteColumn] = useState('');
    const [countryStateColumn, setCountryStateColumn] = useState('');

    const [selectOpen, setSelectOpen] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [validCount, setValidCount] = useState(12); // Initial valid count, can be dynamic
    const [cleanedData, setCleanedData] = useState([]);
    const { Credit } = useSelector(state => state.emailVerifier);
    const [FileModalData, setFileModalData] = useState({

    });
    const { socket } = useContext(socketContextApi);
    const [InsufficientCredit, setInsufficientCredit] = useState(false);
    const [InvalidFileType, setInvalidFileType] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errorModal, setErrorModal] = useState({});
    const initalError = {}
    const [error, setErrors] = useState(initalError);

    const schemaError = Yup.object().shape({
        country: Yup.string().required('Country is required'),
        fullName: Yup.string().nullable(),
        firstName: Yup.string().nullable(),
        lastName: Yup.string().nullable(),
        companyWebsite: Yup.string().nullable(),
        companyName: Yup.string().nullable(),
    }).test('name-fields', null, function (value) {
        const { fullName, firstName, lastName } = value;
        if (!fullName && (!firstName || !lastName)) {
            if (firstName || lastName) {
                if (!firstName) {
                    this.createError({
                        path: 'firstName',
                        message: 'First Name is required if Full Name is not provided',
                    });
                }
                if (!lastName) {
                    return this.createError({
                        path: 'lastName',
                        message: 'Last Name is required if Full Name is not provided',
                    });
                }
            }
            if (!fullName) {
                return this.createError({
                    path: 'fullName',
                    message: 'Full Name is required if First Name and Last Name are not provided',
                });
            }
        }
        return true;
    }).test('company-website-or-name', null, function (value) {
        const { companyWebsite, companyName } = value;
        if (!companyWebsite && !companyName) {
            return this.createError({
                path: 'companyWebsite',
                message: 'Either Company Website or Company Name is required',
            });
        }
        return true;
    });



    const handleInsufficientCredit = () => setInsufficientCredit(!InsufficientCredit);
    const handleInvalidFileType = () => setInvalidFileType(!InvalidFileType);



    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        const file = acceptedFiles[0]; //use type if the file is other than xls or excel then console it

        console.log(file["path"].endsWith('.xlsx'));

        if (file["path"].endsWith('.xlsx') || file["path"].endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
                setColumns(headers);
                setFile(file);
                setOpen(true);
            };
            reader.readAsArrayBuffer(file);

        }
        else {
            setInvalidFileType(true)
        }


        console.log("File rejection catch it !!!");









    }, []);

    const onResetModal = useCallback(() => {
        setFirstNameColumn('');
        setLastNameColumn('');
        setCompanyNameColumn('');
        setWebsiteColumn('');
        setFullNameColumn('');
        setCountryStateColumn('');


    }, [])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: '.xls,.csv',
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDropAccepted: () => setIsDragging(false),
        onDropRejected: () => setIsDragging(false)
    });
    useEffect(() => {
        if (!open) {
            setErrors(initalError);
        }
    }, [open])

    useEffect(() => {
        if (columns.length > 0) {
            const findColumn = (prefixes) => {
                const foundCol = columns.find(col =>
                    prefixes.some(prefix => col.toLowerCase().startsWith(prefix.toLowerCase()))
                );
                return foundCol ? { label: foundCol, value: foundCol } : null;
            };
            setFullNameColumn(findColumn(['FullName', 'fullname', 'Fullname', 'fullName', 'FULLNAME', 'Full Name']) || '')
            setFirstNameColumn(findColumn(['firstName', 'FirstName', 'firstname', 'Firstname', 'FIRSTNAME']) || '');
            setLastNameColumn(findColumn(['lastName', 'LastName', 'lastname', 'Lastname', 'LASTNAME']) || '');
            setCompanyNameColumn(findColumn(['company', 'Company', 'domain', 'Domain']) || '');
            setWebsiteColumn(findColumn(['website', 'Website', 'WEBSITE']) || '');
            setCountryStateColumn(findColumn(['country', 'Country', 'COUNTRY', 'CountRY']));

        }
    }, [columns]);

    const removeDuplicates = (data) => {
        const uniqueRows = [];
        const seenRows = new Set();

        data.forEach((row) => {
            console.log("Remove Duplicate rows is here:::");
          
            const rowString = JSON.stringify(row);
            if (!seenRows.has(rowString)) {
                seenRows.add(rowString);
                uniqueRows.push(row);
            }
        });

        return uniqueRows;
    };


    const handleSubmit = async () => {
        const newErrors = {};

        try {
            console.log("Modal is started");

            // Create a new FileReader instance
            const reader = new FileReader();

            // Define the onload handler for the FileReader
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    console.log("LENGTH FULL DATA = " + jsonData.length);

                    // Remove duplicates
                    const cleanedData = removeDuplicates(jsonData);
                    console.log("Cleaned data is here !!!!");
                    console.log(cleanedData);
                    setCleanedData(cleanedData);
                    setTotalCount(jsonData.length);

                    console.log("REMOVED THE DUPLICATE DATA " + cleanedData.length);
                    console.log(Credit["data"]["points"]);

                    // Check credit
                    if (Credit["data"]["points"] > cleanedData.length) {
                        setOpen(false);
                        setResultOpen(true);
                    } else {
                        handleInsufficientCredit();
                    }

                } catch (innerError) {
                    console.error('Error processing file data:', innerError);
                    // Handle file data processing errors
                    setErrorModal({ global: 'Error processing file data' });
                }
            };

            // Read the file
            reader.readAsArrayBuffer(file);

        } catch (error) {
            console.error('Error:', error);
            // Handle the general errors
            if (error.inner) {
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
            } else {
                newErrors.global = error.message;
            }
            setErrorModal(newErrors);
        }
    };


    const handleSelectOpen = (name, open) => {
        setSelectOpen((prev) => ({ ...prev, [name]: open }));
    };

    const handleOptionChange = (columnType, value) => {
        switch (columnType) {
            case 'firstName':
                setFirstNameColumn(value);
                break;
            case 'lastName':
                setLastNameColumn(value);
                break;
            case 'companyName':
                setCompanyNameColumn(value);
                break;
            case 'companyWebsite':
                setWebsiteColumn(value);
                break;
            case 'fullName':
                setFullNameColumn(value)
                break;
            case 'country':
                setCountryStateColumn(value)
                break;

            default:
                break;
        }
        handleSelectOpen(columnType, false);
    };

    const handleDialogClose = (e) => {
        e.stopPropagation(); // Prevents the dialog from closing
    };

    const user = JSON.parse(localStorage.getItem("user"));


    return (
        <div className="py-2 mb-6 px-3">
            <div className="m-6 flex w-[100%] justify-between mx-2">
                <Typography variant="h3">Bulk Search</Typography>
                <Button color="green" onClick={() => {
                    //downloadData


                    const ws = XLSX.utils.json_to_sheet(downloadData);

                    // Create a new workbook and append the worksheet
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

                    // Generate an Excel file buffer
                    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                    // Create a Blob from the buffer
                    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });



                    const url = window.URL.createObjectURL(dataBlob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'downloadSample.xlsx'; // You can dynamically set the file name
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);










                }}>Sample Download</Button>

            </div>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ease-in-out
                ${isDragging ? 'border-green-500 bg-green-100' : 'border-blue-400 bg-white'}`}
                style={{ position: 'relative' }}
            >
                <input {...getInputProps()} />

                <div>
                    <div className="text-2xl mb-2 text-center flex items-center justify-center" style={{ color: "#9CA3AF" }}>
                        <FaFile /> {/* Replace emoji with React icon */}
                    </div>                    <p className="text-blue-500 font-semibold">Load a file</p>
                    <p className="text-gray-500">or drag and drop a .xls or .csv file</p>
                    <p className="text-gray-500 text-sm">File size upto 10Mb</p>
                </div>

                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 opacity-75 rounded-lg">
                        <p className="text-gray-600 font-semibold">Drop here to upload</p>
                    </div>
                )}
            </div>


            <SampleModal
                errorModal={errorModal}
                isOpen={open}
                handleDialogClose={handleDialogClose}
                file={file}
                FileModalData={FileModalData}
                setFileModalData={setFileModalData}
                fullNameColumn={fullNameColumn}
                setFullNameColumn={setFullNameColumn}
                firstNameColumn={firstNameColumn}
                setFirstNameColumn={setFirstNameColumn}
                lastNameColumn={lastNameColumn}
                companyNameColumn={companyNameColumn}
                WebsiteColumn={WebsiteColumn}
                countryStateColumn={countryStateColumn}
                schemaError={schemaError}


                selectOpen={selectOpen}
                handleSelectOpen={handleSelectOpen}
                columns={columns}
                errors={{}}
                handleOptionChange={handleOptionChange}
                onResetModal={onResetModal}
                setOpen={setOpen}

                handleSubmit={handleSubmit}

            />





            <Dialog open={resultOpen} handler={() => { }} size={"md"} onClose={() => setResultOpen(false)}>
                <div className="grid grid-cols-1 divide-y w-full p-3">
                    <DialogHeader>Processing Results</DialogHeader>
                    <DialogBody>
                        <div className="space-y-4">
                            <Typography variant="h6">Total Rows: {cleanedData.length}</Typography>
                            <Typography variant="h6">Duplicates Removed: {totalCount - cleanedData.length}</Typography>
                            <Typography variant="h6">Estimation Time: {1 + "min"}</Typography>

                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant='text' color='green' onClick={() => {
                            // Send cleaned data to the backend
                            //uploadTesting
                            console.log("Socket data here____");
                            console.log(socket["id"]);
                            console.log("Cleaned Data API 1");
                            console.log(cleanedData);
                            const mappingData = {
                                fullNameColumn: fullNameColumn ? fullNameColumn["value"] : "",
                                firstNameColumn: firstNameColumn ? firstNameColumn["value"] : "",
                                lastNameColumn: lastNameColumn ? lastNameColumn["value"] : "",
                                companyNameColumn: WebsiteColumn ? WebsiteColumn["value"] : "",
                                WebsiteColumn: companyNameColumn ? companyNameColumn["value"] : "",
                                country: countryStateColumn["value"]
                            }
                            console.log("Maping data");
                            console.log(mappingData);
                            Api1('/api/v1/file/uploadTesting', 'post',
                                {
                                    data: cleanedData, socket: socket["id"],
                                    mappingData: mappingData,
                                    id: user["userId"], fileName: file ? file.name : "File-1"

                                })
                                .then(response => response.data)
                                .then(data => {
                                    console.log(data);
                                    setIsLoading(false);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                    setIsLoading(false);
                                });
                            setResultOpen(false)
                            setIsLoading(true);

                        }}>Email Finder</Button>
                         <Button variant='text' color='blue' onClick={() => {
                            // Send cleaned data to the backend
                            //uploadTesting
                            console.log("Socket data here____");
                            console.log(socket["id"]);
                            console.log("Cleaned Data API 1");
                            console.log(cleanedData);
                            const mappingData = {
                                fullNameColumn: fullNameColumn ? fullNameColumn["value"] : "",
                                firstNameColumn: firstNameColumn ? firstNameColumn["value"] : "",
                                lastNameColumn: lastNameColumn ? lastNameColumn["value"] : "",
                                companyNameColumn: WebsiteColumn ? WebsiteColumn["value"] : "",
                                WebsiteColumn: companyNameColumn ? companyNameColumn["value"] : "",
                                country: countryStateColumn["value"]
                            }
                            console.log("Maping data");
                            console.log(mappingData);
                            Api1('/api/v1/file/verification/upload', 'post',
                                {
                                    data: cleanedData, socket: socket["id"],
                                    mappingData: mappingData,
                                    id: user["userId"], fileName: file ? file.name : "File-1"

                                })
                                .then(response => response.data)
                                .then(data => {
                                    console.log(data);
                                    setIsLoading(false);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                    setIsLoading(false);
                                });
                            setResultOpen(false)
                            setIsLoading(true);

                        }}>Email Verification</Button>

                        <Button variant="text" color="red" onClick={() => setResultOpen(false)} className="mr-1">
                            Close
                        </Button>
                    </DialogFooter>
                </div>
            </Dialog>
            <InsufficientCreditModal
                isOpen={InsufficientCredit}
                handleClose={handleInsufficientCredit}
            />
            <InvalidFileTypeModal
                isOpen={InvalidFileType}
                handleClose={handleInvalidFileType}
            />
            <div style={{ marginTop: "4rem" }}></div>
            <WrapperTable />


        </div>
    );
};




export default FileUploadComponent;
