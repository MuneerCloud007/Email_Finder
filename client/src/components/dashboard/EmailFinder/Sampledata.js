// Sample data to be used in the component
const headers = [
    { column: "file_name", label: "File Name" },
    { column: "totalData", label: "Contacts" },
    { column: "totalValid", label: "Found" },
    { column: "status", label: "Status" },
    {column:"download",label:"Download"},
    
  ];
  





  const sampleData = [
    {
      _id:"23423424324332",
      file_name: "contacts_jan2024.xlsx",
      totalData: 1500,
      Found: 1200,
      status: "Completed",
      Data: "2024-01-31"
    },
    {
      _id:"342432",

      file_name: "contacts_feb2024.xlsx",
      totalData: 1800,
      Found: 1600,
      status: "Completed",
      Data: "2024-02-28"
    },
    {
      file_name: "contacts_mar2024.xlsx",
      totalData: 2000,
      Found: 1750,
      status: "Processing",
      Data: "2024-03-31"
    },
    {
      file_name: "contacts_apr2024.xlsx",
      totalData: 2200,
      Found: 2100,
      status: "Completed",
      Data: "2024-04-30"
    },
    {
      file_name: "contacts_may2024.xlsx",
      totalData: 2400,
      Found: 2300,
      status: "Pending",
      Data: "2024-05-31"
    }
  ];
  





  const data = [
    {
      ActiveDirectoryId: "1",
      name: "John Doe",
      email: "john@example.com",
      status: true,
      img: "https://via.placeholder.com/150",
      role: "Administrator",
    },
    {
      ActiveDirectoryId: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: false,
      img: "https://via.placeholder.com/150",
      role: "Editor",
    },
    {
      ActiveDirectoryId: "3",
      name: "Sam Wilson",
      email: "sam@example.com",
      status: true,
      img: "https://via.placeholder.com/150",
      role: "Subscriber",
    },
    {
      ActiveDirectoryId: "4",
      name: "Sara Connor",
      email: "sara@example.com",
      status: true,
      img: "https://via.placeholder.com/150",
      role: "Administrator",
    },
    {
      ActiveDirectoryId: "5",
      name: "Bruce Wayne",
      email: "bruce@example.com",
      status: false,
      img: "https://via.placeholder.com/150",
      role: "Editor",
    },
  ];
  
  export { sampleData, headers };
  