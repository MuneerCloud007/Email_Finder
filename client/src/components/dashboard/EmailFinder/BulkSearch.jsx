import React, { useState, useCallback, useEffect, useContext } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogBody, DialogFooter, DialogHeader, Button, Typography, Select, Option } from '@material-tailwind/react';
import Table1 from '../Table/Table1';
import { sampleData, headers } from './Sampledata';
import {Api1,Api2,Api3} from "../../../features/api/Api";
import socketContextApi from '../../../contextApi/SocketContextApi';
import { useDispatch, useSelector } from 'react-redux';
import {getAllFileSlice} from "../../../features/slice/fileSlice";
const WrapperTable=()=>{
const dispatch=useDispatch();
const user=JSON.parse(localStorage.getItem("user"));
const {loading,data,error}=useSelector((state)=>state.file.FileData);
    useEffect(()=>{
        dispatch(getAllFileSlice({method:"get",url:`/api/v1/file/getAllFile/${user["userId"]}`}));

    },[])
    console.log("Wrapper Table !!!");
    console.log(data);

    return (
        <Table1
                isLoading={loading}
                data={data || []}
                headers={headers}
                loadingTag="Loading"
                processedCount={32}
                totalCount={50}
                validCount={23}
                downloadClickId={(fileId) => {
                    // Implement the download functionality here
                    console.log("Download file with ID:", fileId);
                    const user=JSON.parse(localStorage.getItem("user"));

                    Api3({method:"post",url:"/api/v1/file/download/File",data:{
                        "fileId":fileId,
                        "userId":user["userId"]
                    }}).then((data)=>data.data).then(async(response)=>{
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


                    }).catch((err)=>{
                        console.log(err);
                    })


                    
                  }
                }
            />
    )
}



const FileUploadComponent = () => {
    const [open, setOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [file, setFile] = useState(null);
    const [firstNameColumn, setFirstNameColumn] = useState('');
    const [lastNameColumn, setLastNameColumn] = useState('');
    const [companyNameColumn, setCompanyNameColumn] = useState('');
    const [selectOpen, setSelectOpen] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [validCount, setValidCount] = useState(12); // Initial valid count, can be dynamic
    const [cleanedData, setCleanedData] = useState([]);
    const initalError={
        firstName: false,
        lastName: false,
        companyName: false,
    }
    const {socket}=useContext(socketContextApi);
    

    const [errors, setErrors] = useState(initalError);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
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
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.csv, .xlsx' });

    useEffect(()=>{
        if(!open){
            setErrors(initalError);
        }
    },[open])

    useEffect(() => {
        if (columns.length > 0) {
            const findColumn = (prefixes) => columns.find(col => prefixes.some(prefix => col.toLowerCase().startsWith(prefix.toLowerCase())));
            setFirstNameColumn(findColumn(['firstName', 'FirstName', 'firstname','Firstname','FIRSTNAME']) || '');
            setLastNameColumn(findColumn(['lastName', 'LastName', 'lastname','Lastname','LASTNAME']) || '');
            setCompanyNameColumn(findColumn(['company', 'Company', 'domain', 'Domain','website','Website' ,'WEBSITE']) || '');
        }
    }, [columns]);

    const removeDuplicates = (data) => {
        const uniqueRows = [];
        const seenRows = new Set();

        data.forEach((row) => {
            const rowString = JSON.stringify(row);
            if (!seenRows.has(rowString)) {
                seenRows.add(rowString);
                uniqueRows.push(row);
            }
        });

        return uniqueRows;
    };

    const validateFields = () => {
        const newErrors = {
            firstName: !firstNameColumn,
            lastName: !lastNameColumn,
            companyName: !companyNameColumn,
        };
        setErrors(newErrors);
        return !newErrors.firstName && !newErrors.lastName && !newErrors.companyName;
    };

    const handleSubmit = () => {
        if (validateFields()) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                console.log("LENGTH FULL DATA = " + jsonData.length);

                // Remove duplicates
                const cleanedData = removeDuplicates(jsonData);
                console.log(cleanedData);
                setCleanedData(cleanedData);
                setTotalCount(jsonData.length);

                console.log("REMOVED THE DUPLICATE DATA " + cleanedData.length);
                setOpen(false);
                setResultOpen(true);
            };
            reader.readAsArrayBuffer(file);
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
            default:
                break;
        }
        handleSelectOpen(columnType, false);
    };

    const handleDialogClose = (e) => {
        e.stopPropagation(); // Prevents the dialog from closing
    };

const user=JSON.parse(localStorage.getItem("user"));


    return (
        <div className="py-2 mb-6 px-3">
            <div className="m-6">
                <Typography variant="h3">Bulk Search</Typography>
            </div>
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center cursor-pointer"
            >
                <input {...getInputProps()} />
                <div className="text-2xl mb-2">📁</div>
                <p className="text-blue-500 font-semibold">Load a file</p>
                <p className="text-gray-500">or drag and drop a .xls or .csv file</p>
            </div>

            <Dialog open={open} handler={() => { }} size={"md"} onClose={handleDialogClose}>
                <div className="grid grid-cols-1 divide-y w-full p-3">
                    <DialogHeader>{file ? file.name : 'No file selected'}</DialogHeader>
                    <DialogBody>
                        <div className="space-y-4">
                            <div>
                                <Typography variant="h6">Column First Name</Typography>
                                <Select
                                    open={selectOpen.firstName}
                                    onOpen={() => handleSelectOpen('firstName', true)}
                                    onClose={() => handleSelectOpen('firstName', false)}
                                    value={firstNameColumn}
                                    onChange={(e) => handleOptionChange('firstName', e.target.value)}
                                    className="w-full"
                                    error={errors.firstName}
                                >
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
                                {errors.firstName && (
                                    <Typography color="red" variant="small">
                                        Please select a first name column.
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Typography variant="h6">Column Last Name</Typography>
                                <Select
                                    open={selectOpen.lastName}
                                    onOpen={() => handleSelectOpen('lastName', true)}
                                    onClose={() => handleSelectOpen('lastName', false)}
                                    value={lastNameColumn}
                                    onChange={(e) => handleOptionChange('lastName', e.target.value)}
                                    className="w-full"
                                    error={errors.lastName}
                                >
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
                                {errors.lastName && (
                                    <Typography color="red" variant="small">
                                        Please select a last name column.
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Typography variant="h6">Domain or Company Name</Typography>
                                <Select
                                    open={selectOpen.companyName}
                                    onOpen={() => handleSelectOpen('companyName', true)}
                                    onClose={() => handleSelectOpen('companyName', false)}
                                    value={companyNameColumn}
                                    onChange={(e) => handleOptionChange('companyName', e.target.value)}
                                    className="w-full"
                                    error={errors.companyName}
                                >
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
                                {errors.companyName && (
                                    <Typography color="red" variant="small">
                                        Please select a company name column.
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="text" color="red" onClick={() => setOpen(false)} className="mr-1">
                            Cancel
                        </Button>
                        <Button variant="text" color="blue" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </DialogFooter>
                </div>
            </Dialog>
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
                            const mappingData={firstNameColumn,lastNameColumn,companyNameColumn};
                            console.log("Maping data");
                            console.log(mappingData);
                            Api1('/api/v1/file/uploadTesting','post',
                                {data:cleanedData,socket:socket["id"],
                                    mappingData:mappingData,
                                    id:user["userId"],fileName:file ? file.name:"File-1"
                                
                                })
                            .then(response => response.data)
                                .then(data => {
                                    console.log( data);
                                    setIsLoading(false);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                    setIsLoading(false);
                                });
                                setResultOpen(false)
                                setIsLoading(true);

                        }}>Start Enrichment</Button>

                        <Button variant="text" color="red" onClick={() => setResultOpen(false)} className="mr-1">
                            Close
                        </Button>
                    </DialogFooter>
                </div>
            </Dialog>
            <div style={{ marginTop: "4rem" }}></div>
            <WrapperTable/>
            
          
        </div>
    );
};




export default FileUploadComponent;
