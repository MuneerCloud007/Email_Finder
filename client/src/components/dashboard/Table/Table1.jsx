import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import "./Table.css";

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
            className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
          >
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal leading-none opacity-70"
            >
              {header.label}
              {sortColumn === header.column && (
                <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </Typography>
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
  downloadClickId
}) => {
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

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

  const paginatedData = sortedData.slice(startIdx, endIdx);

  const handleDownloadClick = (fileId) => {
    // Implement the download functionality here
    console.log("Download file with ID:", fileId);
    downloadClickId(fileId)
  };

  return (
    <tbody>
      {!isLoading &&
        paginatedData.map((item) => (
          <tr key={item._id}>
            {headers.map((header, index) => {
              const isLast = index === headers.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <td key={header.column} className={classes}>
                  {header.column === "file_name" ? (
                    <Typography
                      variant="small"
                      color="blue"
                      className="font-normal"
                    >
                      <Link to={`/file/${item._id}`}>
                        {item[header.column]}
                      </Link>
                    </Typography>
                  ) : header.column === "download" ? (
                    item.status === "pending" ? (
                      <div className="loading-bar">Loading...</div>
                    ) : (
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleDownloadClick(item._id)}
                      >
                        Download
                      </Button>
                    )
                  ) : (
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {item[header.column]}
                    </Typography>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
    </tbody>
  );
};


const Pagination = ({
  currentPage,
  totalNumberOfPages,
  handlePageChange,
  maxPageNumbers = 5,
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
      if (currentPage === 1) {
        return ["...", ...pageNumbers.slice(1, maxPageNumbers - 1), totalNumberOfPages];
      }
      return [...pageNumbers.slice(0, maxPageNumbers - 1), "...", totalNumberOfPages];
    } else if (currentPage >= totalNumberOfPages - middleIndex) {
      if (currentPage === totalNumberOfPages) {
        return [...pageNumbers.slice(0, maxPageNumbers), "..."];
      }
      return [...pageNumbers.slice(0, maxPageNumbers - 1), "...", totalNumberOfPages];
    } else {
      const startPage = currentPage - middleIndex + 1;
      const endPage = currentPage + middleIndex - 1;
      return [1, "...", ...pageNumbers.slice(startPage, endPage), "...", totalNumberOfPages];
    }
  };

  return (
    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
      <Typography variant="small" color="blue-gray" className="font-normal">
        Page {currentPage} of {totalNumberOfPages}
      </Typography>
      <div className="flex gap-2">
        <Button
          variant="outlined"
          size="sm"
          onClick={(e) => handlePageChange(e, 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {renderPageNumbers().map((pageNumber, index) => (
          <Button
            key={index}
            variant="text"
            size="sm"
            onClick={(e) => handlePageChange(e, pageNumber)}
            disabled={pageNumber === "..."}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outlined"
          size="sm"
          onClick={(e) => handlePageChange(e, totalNumberOfPages)}
          disabled={currentPage === totalNumberOfPages}
        >
          Next
        </Button>
      </div>
    </CardFooter>
  );
};

const Table = ({ headers, data, isLoading, loadingTag,  downloadClickId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(headers[0].column);
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredData = data.filter((item) =>
    headers.some((header) =>
      String(item[header.column]).toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  const totalNumberOfPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (e, pageNumber) => {
    if (e.target.textContent !== "...") {
      setCurrentPage(pageNumber);
    }
  };

  const handleSortColumnChange = (column) => {
    if (sortColumn === column) {
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Card className="h-[60%] w-full mt-6 ">
      <CardHeader floated={false} shadow={false} className="rounded-none ">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              User File List
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are list file of user
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Input
              label="Search"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0 no-scroll-bar ">
        <table className="mt-4 w-full min-w-max table-auto text-left">
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
            downloadClickId={  downloadClickId
            }
          />
        </table>
      </CardBody>
      {isLoading && (
        <div style={{ textAlign: "center", width: "200px", margin: "0 auto" }}>
          <p>{loadingTag}</p>
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalNumberOfPages={totalNumberOfPages}
        handlePageChange={handlePageChange}
      />
    </Card>
  );
};

export default Table;
