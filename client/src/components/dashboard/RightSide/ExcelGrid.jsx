import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { Api1, Api2 } from "../../../features/api/Api";
import { writeFile, utils } from 'xlsx';

import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Card,
    Input,
} from "@material-tailwind/react";
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ModuleRegistry
]);

const GridExample = ({ user, onGridReady, rowData, setRowData, handleOpen, dummyColumn, columnDefs, setColumnDefs, setNewDataFormat, fileId,operational }) => {
    const gridRef = useRef();
    const [addColTable, setColTable] = useState(false);
    const [addRowTable, setRowTable] = useState(false);
    const [inputData, setInputData] = useState({ col: "" });
    const onhandleColTable = () => setColTable(!addColTable);
    const onhandleRowTable = () => setRowTable(!addRowTable);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    console.log(dummyColumn);
    console.log("Here the user is !!!");
    console.log(user)


    console.log("COLUMN DEF");
    console.log(columnDefs);
    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            flex: 1,
            minWidth: 100,
            filter: true,
        };
    }, []);



    useEffect(() => {
        console.log("gridRef iS OUNTED");
        console.log(gridRef);
        return () => {
            console.log("THE USEFFECT ROWDATA");
            console.log(rowData);
        }
    }, [gridRef.current])







    const addColumn = (newField) => {
        if (newField.trim() === "") return;

        // /add/column
        Api1(`/api/v1/emailVerifier/add/column`,
            "post",
            {
                "userId": user,
                "folder": folder,
                "colName": `custom-column-${newField}`,
                "colValue": ""
            })
            .then((data) => {
                setColumnDefs((prevDefs) => [
                    ...prevDefs,
                    { field: `custom-column-${newField}`, headerName: newField, editable: true },
                ]);
                setRowData((prevData) =>
                    prevData.map((row) => ({ ...row, [newField]: "" }))
                );
                setInputData({ col: "" });
                onhandleColTable();
            }).catch((err) => {
                console.log(err);


            })


    };

    const addRow = () => {
        ///api/v1/emailVerifier/post/rowData
        console.log(user);
        Api1(`/api/v1/file/addRow`,
            "post",
            {
                "userId": user["userId"],
                "fileId": fileId
            }).then((data) => {
                console.log("NEW ROW")
                console.log(data);
                console.log(data.data);
                const newRow = { ...data.data };
                console.log(newRow["data"]);
                setRowData((prevData) => [...prevData, newRow["data"]]);
                onhandleRowTable();
            }).catch((err) => console.log(err))

    };

    console.log("ROw data values is:-");
    console.log(rowData);

    console.log("THIS IS THE USEREF");
    console.log(gridRef.current)







    return (
        <div className="container my-3 h-[60vh] pb-4 ">
            <div className="example-wrapper h-[80%]">
                <Dialog open={addColTable} handler={onhandleColTable}>
                    <DialogHeader>Do You want To Add Column?</DialogHeader>
                    <DialogBody>
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="h6" color="blue-gray" className="-mb-3">
                                Column Name
                            </Typography>
                            <Input
                                size="lg"
                                label="Enter Column Name"
                                value={inputData.col}
                                onChange={(e) =>
                                    setInputData({ ...inputData, col: e.target.value })
                                }
                            />
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            variant="text"
                            color="red"
                            onClick={onhandleColTable}
                            className="mr-1"
                        >
                            <span>Cancel</span>
                        </Button>
                        <Button
                            variant="gradient"
                            color="green"
                            onClick={() => {
                                if (gridRef.current && gridRef.current.api) {
                                    const rowCount = gridRef.current.api.getDisplayedRowCount();
                                    console.log('Number of rows:', rowCount);
                                    if (rowCount > 0) {
                                        addColumn(inputData.col)


                                    }
                                    else {
                                        alert("No data found !!!!");
                                    }
                                    setInputData({ ...inputData, col: undefined })
                                }

                            }}
                        >
                            <span>Confirm</span>
                        </Button>
                    </DialogFooter>
                </Dialog>

                <Dialog open={addRowTable} handler={onhandleRowTable}>
                    <DialogHeader>Do You want To Add Row?</DialogHeader>
                    <DialogBody>
                        <Typography color="blue-gray" className="mb-2">
                            Are you sure you want to add a row?
                        </Typography>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            variant="text"
                            color="red"
                            onClick={onhandleRowTable}
                            className="mr-1"
                        >
                            <span>Cancel</span>
                        </Button>
                        <Button variant="gradient" color="green" onClick={addRow}>
                            <span>Confirm</span>
                        </Button>
                    </DialogFooter>
                </Dialog>
                <div className="div flex justify-end pr-2 pb-4 gap-3">

                    <Button className="mt-4" color="green" onClick={() => {
                        if (gridRef.current && gridRef.current.api) {
                            const rowCount = gridRef.current.api.getDisplayedRowCount();
                            console.log('Number of rows:', rowCount);
                            console.log("operation value is given here pls chceck =" +operational)
                            if (rowCount > 0) {
                                const newData = rowData.reduce((newValue, value) => {
                                    newValue.push({
                                        "First Name": value["firstName"],
                                        "Last Name": value["lastName"],
                                        "Domain or CompanyName": value["domain"],
                                        "Vivasales Email": value["email"],
                                        "Vivasales Quality":operational == "EmailFinder"?"N/A":value['quality'] || "unknown",
                                        "Vivasales Email Status": operational == "EmailFinder"?"N/A":value['status'] || "unknown",
                                        "MxProvider": value["mxProvider"],
                                        "MxRecord": value["mxRecord"]
                                    });
                                    return newValue;
                                }, []);

                                console.log("newData");
                                console.log(newData);
                                setNewDataFormat(newData);
                                handleOpen(newData);



                            }
                            else {
                                alert("No data foudnd can't export !!!!");
                            }
                        }
                    }}>
                        EXPORT ALL
                    </Button>
                   

                    <div className="relative group inline-block">
                        <Button className="mt-4" color="purple" onClick={() => alert("Next Level enrichment")}>
                            Next Level Enrichment
                        </Button>
                        <div className="opacity-0 w-72 p-2 bg-gray-200 text-gray-800 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 group-hover:translate-y-[-10px] bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-300">
                            Via Waterfall Enrichment we will again try to find and verify the Invalid and Not Found email ids
                            <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-200 rotate-45 bottom-[-6px]"></div>
                        </div>
                    </div>


                </div>



                <div style={gridStyle} className="ag-theme-quartz py-2 ">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={5}
                        domLayout='autoHeight'
                        enableRangeSelection={true}
                        suppressMultiRangeSelection={true}
                        onGridReady={onGridReady}
                        animateRows={true}

                    // Remove or set rowSelection to 'single' to remove checkboxes
                    />
                </div>
            </div>
        </div>
    );
};

export default GridExample