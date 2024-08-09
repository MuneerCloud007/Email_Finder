import React, { Suspense } from 'react'
import SidebarOne from './LeftSide/LeftSideDashboard'
import ReactJsClientSideTable from "./RightSide/RightSideDashboard";
import { useState } from 'react';
import "../../App.css"
import FileUpload from './RightSide/FileUpload';
import EmailVerifier from "./RightSide/Bulk Xls/EmailVerifier.jsx";
import DomainFinder from "./RightSide/Bulk Xls/DomainFinder.jsx";
import Setting from "./RightSide/customization/Setting.jsx";
import Theme from "./RightSide/customization/Theme.jsx"
import NotDeveloped from "../../pages/Notdeveloped.jsx"
import TransactionsTable from "./RightSide/FileTable/FileTable.jsx"
import BulkSearch from "./EmailFinder/BulkSearch.jsx";
import SingleSearch from "./EmailFinder/SingleSearchPage.jsx"
import ProfilePage from './Profile/ProfilePage.jsx';
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};


function Dashboard() {
  const [RightSideState, setRightSideState] = useState(1);

  //1 for Folders
  //2 for File Upload
  //3 for Theme 
  //4 Profile Setting
  //5

  console.log(RightSideState)


  return (
    <div className='dashboard flex  my-4 h-[78%]   overflow-y-auto no-scroll-bar'>

      <SidebarOne
      RightSideState={RightSideState} 
      setRightSideState={setRightSideState}
      />


      {RightSideState == 1 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>


          <BulkSearch />
      </div>
      }
      {RightSideState == 2 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column" }}>
        <SingleSearch/>


      </div>
      }

{RightSideState == 3 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column" }}>
        <NotDeveloped/>


      </div>
      }
      {RightSideState == 4 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column" }}>
        <ProfilePage/>


      </div>
      }
      {RightSideState == 5 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column" }}>
        <NotDeveloped/>


      </div>
      }
      {RightSideState == 6 && <div className=' container p-4 mt-3' style={{ display: "flex", flexDirection: "column" }}>
        <Setting/>


      </div>
      }


    </div>
  )
}

export default Dashboard