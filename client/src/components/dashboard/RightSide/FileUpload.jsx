import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogBody, DialogFooter, DialogHeader, Button, Typography, Select, Option } from '@material-tailwind/react';

const FileUploadComponent = () => {
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [file, setFile] = useState(null);
    const [firstNameColumn, setFirstNameColumn] = useState('');
    const [lastNameColumn, setLastNameColumn] = useState('');
    const [companyNameColumn, setCompanyNameColumn] = useState('');

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

    const handleSubmit = () => {
        // Implement your file upload logic here
        console.log('File submitted:', file);
        console.log('First Name Column:', firstNameColumn);
        console.log('Last Name Column:', lastNameColumn);
        console.log('Company Name Column:', companyNameColumn);
        setOpen(false);
    };

    return (
        <div className=" py-2 mb-6">
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center cursor-pointer"
            >
                <input {...getInputProps()} />
                <div className="text-2xl mb-2">📁</div>
                <p className="text-blue-500 font-semibold">Load a file</p>
                <p className="text-gray-500">or drag and drop a .xls or .csv file</p>
            </div>

            <Dialog open={open} handler={setOpen} size={"md"}>
                <div className="grid grid-cols-1 divide-y w-full p-3">
                    <DialogHeader>{file ? file.name : 'No file selected'}</DialogHeader>
                    <DialogBody>
                        <div className="space-y-4">
                            <div>
                                <Typography variant="h6">Column First Name</Typography>
                                <Select value={firstNameColumn} onChange={(e) => setFirstNameColumn(e.target.value)} className="w-full">
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Typography variant="h6">Column Last Name</Typography>
                                <Select value={lastNameColumn} onChange={(e) => setLastNameColumn(e.target.value)} className="w-full">
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Typography variant="h6">Domain or Company Name</Typography>
                                <Select value={companyNameColumn} onChange={(e) => setCompanyNameColumn(e.target.value)} className="w-full">
                                    {columns.map((col, index) => (
                                        <Option key={index} value={col}>{col}</Option>
                                    ))}
                                </Select>
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
        </div>
    );
};

export default FileUploadComponent;
