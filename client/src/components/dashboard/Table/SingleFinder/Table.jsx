import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import AgGridTable from "./AgGridTable"; 
import { Typography } from '@material-tailwind/react';
import {getAllSingleEmailSearchSlice} from "../../../../features/slice/singleEmailSearch";

function Table() {

    const singleEmailSearch = useSelector((state) => state.singleEmailSearch);
    const gridRef = useRef();
    const user = JSON.parse(localStorage.getItem("user"));
    const dispatch=useDispatch();



    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: 'First Name', field: 'firstName',

        

        },
        { headerName: 'Last Name', field: 'lastName' },
        { headerName: 'Operational', field: 'operational' },
        { headerName: 'Quality', field: 'quality' },
        { headerName: 'Status', field: 'status' },
        {
            headerName:"Email",field:'email'
        },

        {
            headerName: 'Completed', field: "completed"
        },

    ]);

    useEffect(() => {
        dispatch(getAllSingleEmailSearchSlice({
            method:"post",
            url:"/api/v1/single/search/getAll",
            data:{
                id:user["userId"]
            }
        }));

    }, [])




    return (

        <div className='w-[90%] mx-auto mt-10'>
            <div className="table">
                <AgGridTable
                columnDefs={columnDefs}
                gridRef={gridRef}
                rowData={singleEmailSearch.data}
                isLoading={singleEmailSearch.loading}
                user={user}
                />
            </div>
        </div>
    )
}

export default Table