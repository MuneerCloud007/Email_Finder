import React, { useState } from "react";

const TableHeader = ({
  headers,
  onSortColumnChange,
  sortColumn,
  sortDirection,
}) => {
  const handleHeaderClick = (column) => {
    onSortColumnChange(column);
  };

  return (
    <thead>
      <tr>
        {headers.map((header) => (
          <th
            key={header.column}
            onClick={() => handleHeaderClick(header.column)}
          >
            {header.label}{" "}
            {sortColumn === header.column && (
              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const TableBody = ({
  headers,
  data,
  currentPage,
  itemsPerPage,
  sortColumn,
  sortDirection,
  isLoading,
}) => {
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  // Sort data based on the default sorting column and direction
  const sortedData = [...data].sort((a, b) => {
    const columnA = a[sortColumn];
    const columnB = b[sortColumn];

    if (columnA < columnB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (columnA > columnB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // const paginatedData = data.slice(startIdx, endIdx);
  const paginatedData = sortedData.slice(startIdx, endIdx);

  return (
    <>
      <tbody>
        {!isLoading &&
          paginatedData.map((item) => (
            <tr key={item.ActiveDirectoryId}>
              {headers.map((header) => (
                <td key={header.column}>{item[header.column]}</td>
              ))}
            </tr>
          ))}
      </tbody>
    </>
  );
};

const Pagination = ({
  currentPage,
  totalNumberOfPages,
  handlePageChange,
  maxPageNumbers = 5, // Set the maximum number of page numbers to display
}) => {
  const pageNumbers = Array.from(
    { length: totalNumberOfPages },
    (_, index) => index + 1
  );

  const renderPageNumbers = () => {
    if (totalNumberOfPages <= maxPageNumbers) {
      return pageNumbers;
    }

    const middleIndex = Math.floor(maxPageNumbers / 2);

    if (currentPage <= middleIndex) {
      // Display pages from 1 to maxPageNumbers
      if(currentPage==1){
        return [
        
          "...",
          ...pageNumbers.slice(1, maxPageNumbers - 1),
          totalNumberOfPages,
        ];
      }
      return [
        
        ...pageNumbers.slice(0, maxPageNumbers - 1),
        "...",
        totalNumberOfPages,
      ];
    
    } else if (currentPage >= totalNumberOfPages - middleIndex) {
      // Display pages from totalNumberOfPages - maxPageNumbers + 2 to totalNumberOfPages
      if(currentPage == totalNumberOfPages) {
        return [
          ...pageNumbers.slice(0, maxPageNumbers ),
          "...",
        ]; 
      }
      return [
        ...pageNumbers.slice(0, maxPageNumbers - 1),
        "...",
        totalNumberOfPages,
      ];
     
    } else {
      // Display pages around the current page
      const startPage = currentPage - middleIndex + 1;
      const endPage = currentPage + middleIndex - 1;
      return [
        1,
        "...",
        ...pageNumbers.slice(startPage, endPage),
        "...",
        totalNumberOfPages,
      ];
    }
  };

  return (
    <div className="flex gap-3 items-center mt-5 mb-2 justify-between">
      <div className="col-md-3 col-sm-12 text-start">
        Showing 1 to {totalNumberOfPages} of {totalNumberOfPages} entries
      </div>
      <div className="col-md-3 col-sm-12 text-end">
        <div className="pagination flex list-none join">
          <li className="page-item">
            <button
              className={"page-link join-item btn " + (currentPage === 1 ? "disabled" : "")}
              onClick={(e) => handlePageChange(e,1)}
              disabled={currentPage === 1}
            >{`<`}</button>
          </li>
          {renderPageNumbers().map((pageNumber, index) => (
            <li key={index} className="page-item">
              <button
                className={`page-link ${
                  currentPage === pageNumber ? "active" : ""
                } join-item btn`}
                onClick={(e) => handlePageChange(e,pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              className={
                "page-link " + "join-item btn "+
                (currentPage === totalNumberOfPages ? "disabled" : "")
              }
              onClick={(e) => handlePageChange(e,totalNumberOfPages)}
              disabled={currentPage === totalNumberOfPages}
            >{`>`}</button>
          </li>
        </div>
      </div>
    </div>
  );
};

const Table = ({ headers, data, isLoading, loadingTag }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState(""); // Added state for search
  const [itemsPerPage, setItemsPerPage] = useState(5); // Added state for itemsPerPage
  const [sortColumn, setSortColumn] = useState(headers[0].column); // Default sorting column
  const [sortDirection, setSortDirection] = useState("asc"); // Default sorting direction

  // Added filteredData variable to hold filtered data based on search
  const filteredData = data.filter((item) =>
    headers.some((header) =>
      String(item[header.column])
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    )
  );

  const totalNumberOfPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (e,pageNumber) => {
    if(e.target.textContent!=="...") {
    setCurrentPage(pageNumber);
    }
  };

  const handleSortColumnChange = (column) => {
    // Toggle sort direction if the same column is clicked again
    if (sortColumn === column) {
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  return (
    <div className=" w-[100%] h-[100%] mt-auto" >
      <div className="flex justify-between   items-center my-5">
        <div className="text-start">
          <div className="input-group flex items-center gap-3">
            <span htmlFor="inputGroupSelect01"
              className="btn btn-outline btn-sm "
            >
              Show
            </span>
            {/* <div style={{ width: '200px' }}> */}
            <div>


              <select className="select select-bordered w-full max-w-xs select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
              >

                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span id="inputGroupSelect02"
              className="btn btn-outline btn-sm"
            >
              entries
            </span>
            {/* {buttonAdd} */}
          </div>
        </div>
        <div className="text-end">
          <div className="input-group">

            <label className="input input-bordered flex items-center gap-2">
              <input type="text" className="grow form-control" placeholder="Search"
                value={searchValue}
                onChange={handleSearchChange}
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
            </label>
          </div>
        </div>
      </div>
      <br></br>

      <div className="table">
        <table className="table">
          <TableHeader
            headers={headers}
            onSortColumnChange={handleSortColumnChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
          <TableBody
            headers={headers}
            data={filteredData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            isLoading={isLoading}
            loadingTag={loadingTag}
          />
        </table>
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", width: "200px", margin: "0 auto" }}>
          <p>{loadingTag}</p>
        </div>
      ) : (
        ""
      )}

      <Pagination
        currentPage={currentPage}
        totalNumberOfPages={totalNumberOfPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default Table;