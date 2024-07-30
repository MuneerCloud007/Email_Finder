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

const GridExample = ({ user, onGridReady, rowData, dummyColumn, columnDefs,isLoading  }) => {
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



   






 



    return (
        <div className="container my-3 h-[60vh] pb-4 ">
            <div className="example-wrapper h-[80%]">
              
               



                <div style={gridStyle} className="ag-theme-quartz py-2 ">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        loading={isLoading}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={5}
                        domLayout='autoHeight'
                        enableRangeSelection={true}
                        suppressMultiRangeSelection={true}
                        onGridReady={onGridReady}
                        animateRows={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default GridExample