import React, { useState } from "react";
import { useAsyncDebounce } from "react-table";
import { useMemo,memo } from "react";





function  GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  gotoPage
}) {
    console.log(preGlobalFilteredRows);
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = ((value) => {
    setGlobalFilter(value || undefined);
    gotoPage(0);

  
  })


  return (
    <div style={{marginBlock:"1.5rem"}}>
   
    <input type="text" />
    </div>
  );
}
export default memo(GlobalFilter);