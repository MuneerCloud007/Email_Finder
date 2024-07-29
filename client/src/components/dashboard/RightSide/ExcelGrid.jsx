import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import { Api1, Api2 } from "../../../features/api/Api";
import { writeFile, utils } from 'xlsx';

import { MenuModule } from "@ag-grid-enterprise/menu";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
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
    ClipboardModule,
    MenuModule,
    RangeSelectionModule,
    MultiFilterModule,
    SetFilterModule,
]);

const GridExample = ({ user, onGridReady, rowData, setRowData, handleOpen, dummyColumn, columnDefs, setColumnDefs, setNewDataFormat, fileId }) => {
    const gridRef = useRef();
    let gridApi = useRef();
    const [addColTable, setColTable] = useState(false);
    const [addRowTable, setRowTable] = useState(false);
    const [inputData, setInputData] = useState({ col: "" });
    const onhandleColTable = () => setColTable(!addColTable);
    const onhandleRowTable = () => setRowTable(!addRowTable);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    console.log(dummyColumn);
    console.log("Here the user is !!!");
    console.log(user)


    console.log("COLUMN DEF");
    console.log(columnDefs);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
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






    const updateRowData = (updatedData) => {
        setRowData((prevRowData) =>
            prevRowData.map((row) => (row.id === updatedData.id ? updatedData : row))
        );
    };

    const updateColumnDefs = () => {
        if (gridRef.current) {
            const columnDefs = gridRef.current.columnApi.getAllColumns().map((col) => ({
                headerName: col.colDef.headerName,
                field: col.colDef.field,
                editable: col.colDef.editable,
                sortable: col.colDef.sortable,
                resizable: col.colDef.resizable,
            }));
            setColumnDefs(columnDefs);
        }
    };


    const onSelectionChanged = (params) => {
        const selectedRows = params.api.getSelectedRows();
        const selectedRowIds = selectedRows.map(row => row.id);
        setRowData(rowData.filter(row => !selectedRowIds.includes(row.id)));
    };


    const selectColumn = (column) => {
        gridRef.current.api.forEachNode((node) => {
            const cellRange = {
                rowStartIndex: node.rowIndex,
                rowEndIndex: node.rowIndex,
                columns: [column],
            };
            gridRef.current.api.addCellRange(cellRange);
        });
    };



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


    const getUpdatedData = () => {
        if (gridRef.current) {
            const rowData = [];
            gridRef.current.api.forEachNode(node => rowData.push(node.data));
            console.log('Row Data:', rowData);
            console.log(gridRef.current.api.getColumnDefs())






        }
    };
    const onButtonClick = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        selectedNodes.forEach((vl) => {

            console.log("SECLECTED NODES!!!");
            console.log(vl.data)
        });
        console.log("DELETE ROW ACTION");
        console.log(selectedNodes);
        const selectedIds = selectedNodes.map(node => node.data["_id"]);
        console.log("Selected Id for delete rows");
        console.log(selectedIds);
        const folder = { folder: "fdfsdfdsfdsfds" };

        ///delete/table

        Api1(`/api/v1/file/delete/rowData`,
            "delete",
            { data: selectedIds, fileId, user: user["userId"] }
        ).then((data) => {
            console.log("DELETED ROW");
            console.log(data);
            setRowData(rowData.filter(row => !selectedIds.includes(row["_id"])));
        }).catch((err) => console.log(err))
    };

    const onCellValueChanged = useCallback((params) => {
        // const updatedData = rowData.map(row => (row.id === event.data.id ? event.data : row));
        // // setRowData(updatedData);
        // console.log(updatedData);
        // console.log(rowData);
        // console.log("Event@!")
        // console.log(event.data)

        // // // Send updated cell data to server
        // // fetch(`https://your-server.com/api/data/${event.data.id}`, {
        // //   method: 'PUT',
        // //   headers: {
        // //     'Content-Type': 'application/json'
        // //   },
        // //   body: JSON.stringify(event.data)
        // // });
        console.log(params.data);

        //Id , colName , value

        const changedColumn = params.colDef.field; // Get the column field name
        const oldValue = params.oldValue;
        const newValue = params.newValue;


        const data = {
            colId: params.data["_id"],
            colName: changedColumn,
            oldValue: oldValue,
            colValue: newValue
        }
        console.log(data);
        if (data.colId) {
            console.log("DATA COLID IS HERE !!!!");
            const user = JSON.parse(localStorage.getItem("user"));
            console.log(params.data.user);


            Api1(
                `/api/v1/file/update/cell/${user["userId"]}`,
                "put",
                { ...data }

            ).then((data) => {
                console.log(data)

            }).catch((err) => {
                console.log(err)

            })
        }



        console.log(`Column ${changedColumn} changed from ${oldValue} to ${newValue}`);
    }, []);




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
                <div className="div flex justify-end pr-2 pb-4">
                    <Button className="mt-4" color="green" onClick={() => {
                        if (gridRef.current && gridRef.current.api) {
                            const rowCount = gridRef.current.api.getDisplayedRowCount();
                            console.log('Number of rows:', rowCount);
                            if (rowCount > 0) {
                                const newData = rowData.reduce((newValue, value) => {
                                    newValue.push({
                                        firstName: value["firstName"],
                                        lastName: value["lastName"],
                                        email: value["email"],
                                        domain: value["domain"],
                                        certainty: value["certainty"]
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
                        EXPORT
                    </Button>
                </div>
                <div className=' flex justify-end px-2 py-3 gap-3'>

                    <Button className="mt-4" color="teal" onClick={onhandleRowTable}>
                        Add Row
                    </Button>
                    <Button onClick={onButtonClick} className="mt-4" color="red">Delete Rows</Button>


                </div>


                <div style={gridStyle} className="ag-theme-quartz py-2 ">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        overflow-auto
                        pagination={true}
                        paginationPageSize={5}
                        domLayout='damLayout'
                        enableRangeSelection={true}
                        suppressMultiRangeSelection={true}
                        onCellValueChanged={onCellValueChanged}
                        onRowDataUpdated={(e) => {
                            console.log(e);
                        }}


                        onGridReady={onGridReady}



                        animateRows={true}
                        rowSelection={"multiple"}
                    />
                </div>
            </div>
        </div>
    );
};

export default GridExample