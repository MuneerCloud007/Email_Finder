import TableClientSideBlog from "../../TableComponent";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllEmailVerifier } from "../../../features/slice/emailVerifier";
import { Grid, Input, Select } from 'react-spreadsheet-grid'
import ExcelGrid from "./ExcelGrid";
import { writeFile, utils } from 'xlsx';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";





function ReactJsClientSideTable({fileId}) {
  const [dataMyTable, setdataMyTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();
  const [folder, setFolder] = useState();
  const [rowData, setRowData] = useState();

  const initailColumnDef = [

    {
      field: "firstName", editable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,

    },
    {
      field: "lastName"
    },
    {
      field: "domain",
    },
   

    { field: "email", },
    {field:"certainty",},
    {field:"mxProvider"},{field:"mxRecord"}



  ]
  const [columnDefs, setColumnDefs] = useState(initailColumnDef);
console.log("FIELD_______________________________"+fileId);



  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(!open);

  const dispatch = useDispatch();
  const FolderData = useSelector((state) => state.emailVerifier.FolderData);
  const EmailVerifierData = useSelector((state) => state.emailVerifier.EmailVerifier);






  useEffect(() => {
  
      onGridReady();


    
  }, []);

  const [customColumn, setCustomColumn] = useState();
  let dummyColumn = [];
  const [NewDataFormat,setNewDataFormat]=useState([]);




  const onGridReady = useCallback((params) => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("GRID READY !!!!");


    fetch('http://localhost:5000/api/v1/file/file/getById', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "fileId":fileId

      })
    })
      .then((resp) => {
        setColumnDefs(initailColumnDef);
        return resp.json()
      })
      .then(({data,success}) => {
        console.log("DATA")
        console.log(data);
        
      const newArray= [...data["fileData"]];


        setColumnDefs([...columnDefs]);
        console.log(newArray);
        setRowData(newArray);

      })
      .catch((err) => {
        console.log(err);
        setRowData([]);


      })


  }, []);



  const convertToExcel = (data) => {
console.log("CONVERT TO EXCEL THE DAYA");
console.log(data);

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sheet1');
    writeFile(wb, 'data.xlsx');
  };





    return (
      <div className="container py-3">


        <Dialog open={open} handler={handleOpen}>
          <DialogHeader>Do You want to dowload it ?</DialogHeader>
          <DialogBody>
            It's contains data of the customer info
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleOpen}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="green" onClick={() => {
              convertToExcel(NewDataFormat);
              handleOpen();

            }}>
              <span>Download</span>
            </Button>
          </DialogFooter>
        </Dialog>




        <ExcelGrid
          onGridReady={onGridReady}
          user={ JSON.parse(localStorage.getItem("user"))}
          folder={folder}
          rowData={rowData}
          fileId={fileId}
          handleOpen={handleOpen}
          setNewDataFormat={setNewDataFormat}
          setRowData={setRowData}
          dummyColumn={dummyColumn}
          customColumn={customColumn}
          columnDefs={columnDefs}
          setColumnDefs={setColumnDefs}
        />
      </div>

    )
  }


export default ReactJsClientSideTable