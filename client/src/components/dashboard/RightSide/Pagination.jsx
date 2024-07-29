import React, { useContext, createContext, useState } from "react";

const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
  const [offset, setOffset] = useState(0);
const [clear,setClear]=useState(true)

  return (
    <PaginationContext.Provider value={{ offset, setOffset,setClear,clear }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => {
  return useContext(PaginationContext);
};