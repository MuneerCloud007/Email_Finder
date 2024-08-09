import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoIosArrowRoundBack } from "react-icons/io";
import { Typography, Card, CardHeader, Chip, CardBody, CardFooter, List, ListItem, ListItemSuffix } from "@material-tailwind/react";
import SecondTable from "../RightSide/RightSideDashboard"
import { Api1 } from '../../../features/api/Api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';





const Tag = ({ label, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    gray: 'bg-gray-500 text-white',
    yellow: ' bg-yellow-500 text-white'
    // Add more colors as needed
  };





  return (
    <Chip
      value={label}
      className={`cursor-pointer ${colorClasses[color]} px-1 w-6 text-center rounded-full `}
      size='sm'
      onClick={onClick}
    />
  );
};

const formatDate = (isoString) => {
  console.log(isoString);
  const date = new Date(isoString);

  console.log("formatDate");
  console.log(date);

  // Format as "yy-MMM-dd hh:mm a"
  const formattedDate = format(date, 'yy-MMM-dd hh:mm a');
  return formattedDate;
};



const EmailVerificationRenderingCard=( {loading,error,navigate,user,file,id,operational})=>{
  return (<>
   <div className='fileId h-[80%] m-2 p-2 ml-5 overflow-auto no-scroll-bar'>
          <div className="backbutton flex gap-2 items-center mt-3">
            <IoIosArrowRoundBack
              style={{ width: "1.5rem", height: "1.5rem", cursor: "pointer" }}
              onClick={() => {
                navigate("/dashboard");
              }}
            />
            <p>Back to my dashboard</p>
          </div>
  
          <div className='ml-5'>
            <div className='mt-2'>
              <div className='flex items-center gap-2 my-3'>
                {loading ? (
                  <Skeleton width={150} height={40} />
                ) : (
                  <Typography className='' variant='h2'>{
                    `${file && file?.["file_name"]}`
  
                  }</Typography>
                )}
                {loading ? (
                  <Skeleton width={100} height={25} />
                ) : (
                  <Typography className='text-gray-500' variant='h6'>
                    ({`Total Rows:${file && file?.["fileData"]?.length}`})
                  </Typography>
                )}
              </div>
            </div>
          </div>
  
          {loading ? (
            <Card className='w-[40%]'>
              <CardBody >
                <h1>
                  <Skeleton width={100} />
                </h1>
                <div className="divider"><Skeleton width={100} /></div>
                <List>
                  {[...Array(5)].map((_, index) => (
                    <ListItem key={index}>
                      <Skeleton width={150} />
                      <ListItemSuffix>
                        <Skeleton width={50} />
                      </ListItemSuffix>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
              <CardFooter>
                <Skeleton width={100} />
              </CardFooter>
            </Card>
          ) :
  
  
  
            <Card className=' w-[30%] '>
  
              <CardBody >
                <h1>{`Stats`}</h1>
                <div className="divider"></div>
  
                <List>
                <ListItem>
                    Operational Type
                    <ListItemSuffix>
                      <Chip
                        value={operational}
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      />
                    </ListItemSuffix>
                  </ListItem>

                  <ListItem>
                    Total Records
                    <ListItemSuffix>
                      <Chip
                        value={file["totalData"]}
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      />
                    </ListItemSuffix>
                  </ListItem>
                  <ListItem>
                    Created Date
                    <ListItemSuffix>
                      <Chip
                        value={(file["createdAt"]) ? formatDate(file["createdAt"]) : "Not found"}
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      />
                    </ListItemSuffix>
                  </ListItem>
                </List>
                <div className="divider"></div>
                <div className="wrapper-container-finder">
                <p className=' font-semibold mb-3 ml-2'>Email Finder</p>
                <div className="container flex w-[100%] justify-evenly">
                 
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Found</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["totalValid"]} >
  
                    </Tag>
                    </div>
                  </div>
  
                 
  
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Not Found</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["totalData"]-file["totalValid"]} >
  
                    </Tag>
                    </div>
                  </div>
  
              

              
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Credit Consumed</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["totalValid"]} >
  
                    </Tag>
                    </div>
                  </div>
  
  
                
  
  
  
                </div>

                  
                </div>
                <div className="divider"></div>


                <div className="wrapper-container">
                <p className=' font-semibold mb-3 ml-2'>Email Verification</p>
                <div className="container flex w-[100%] justify-evenly">
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Found</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["EmailVerify"]["totalValid"] + file["EmailVerify"]["disposable"]} >
  
                    </Tag>
                    </div>
                  </div>
  
                 
  
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Not Found</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["EmailVerify"]["totalInvalid"]} >
  
                    </Tag>
                    </div>
                  </div>
  
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Catch All</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["EmailVerify"]["catch_all"]} >
  
                    </Tag>
                    </div>
                  </div>

                 
                  <div className="sub-1 flex flex-col gap-3">
                    <p className=' font-semibold'>Credit Consumed</p>
                    <div className="wrapper-tag flex justify-center">
  
                    <Tag label={file && file["totalValid"]} >
  
                    </Tag>
                    </div>
                  </div>
  
  
                
  
  
  
                </div>
  
                </div>

              

  
                
  
  
  
              </CardBody>
              <CardFooter>
  
              </CardFooter>
  
            </Card>}
  
  
  
  
  
          <div className='w-[90%] m-auto'>
            {loading ? (
              <Skeleton count={5} height={40} />
            ) : (
              <SecondTable fileId={id} />
            )}
          </div>
        </div>
  
  </>)
  }

const EmailFinderRenderingCard=({loading,error,navigate,user,file,id,operational})=>{
  return (<>
    <div className='fileId h-[80%] m-2 p-2 ml-5 overflow-auto no-scroll-bar'>
           <div className="backbutton flex gap-2 items-center mt-3">
             <IoIosArrowRoundBack
               style={{ width: "1.5rem", height: "1.5rem", cursor: "pointer" }}
               onClick={() => {
                 navigate("/dashboard");
               }}
             />
             <p>Back to my dashboard</p>
           </div>
   
           <div className='ml-5'>
             <div className='mt-2'>
               <div className='flex items-center gap-2 my-3'>
                 {loading ? (
                   <Skeleton width={150} height={40} />
                 ) : (
                   <Typography className='' variant='h2'>{
                     `${file && file?.["file_name"]}`
   
                   }</Typography>
                 )}
                 {loading ? (
                   <Skeleton width={100} height={25} />
                 ) : (
                   <Typography className='text-gray-500' variant='h6'>
                     ({`Total Rows:${file && file?.["fileData"]?.length}`})
                   </Typography>
                 )}
               </div>
             </div>
           </div>
   
           {loading ? (
             <Card className='w-[40%]'>
               <CardBody >
                 <h1>
                   <Skeleton width={100} />
                 </h1>
                 <div className="divider"><Skeleton width={100} /></div>
                 <List>
                   {[...Array(5)].map((_, index) => (
                     <ListItem key={index}>
                       <Skeleton width={150} />
                       <ListItemSuffix>
                         <Skeleton width={50} />
                       </ListItemSuffix>
                     </ListItem>
                   ))}
                 </List>
               </CardBody>
               <CardFooter>
                 <Skeleton width={100} />
               </CardFooter>
             </Card>
           ) :
   
   
   
             <Card className=' w-[30%] '>
   
               <CardBody >
                 <h1>{`Stats`}</h1>
                 <div className="divider"></div>
   
                 <List>
                 <ListItem>
                    Operational Type
                    <ListItemSuffix>
                      <Chip
                        value={"Email Finder"}
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      />
                    </ListItemSuffix>
                  </ListItem>
                   <ListItem>
                     Total 
                     <ListItemSuffix>
                       <Chip
                         value={file["totalData"]}
                         variant="ghost"
                         size="sm"
                         className="rounded-full"
                       />
                     </ListItemSuffix>
                   </ListItem>
                   <ListItem>
                     Created Date
                     <ListItemSuffix>
                       <Chip
                         value={(file["createdAt"]) ? formatDate(file["createdAt"]) : "Not found"}
                         variant="ghost"
                         size="sm"
                         className="rounded-full"
                       />
                     </ListItemSuffix>
                   </ListItem>
                 </List>
                 <div className="divider"></div>
                 <div className="wrapper-container-finder">
                 <p className=' font-semibold mb-3 ml-2'>Email Finder</p>
                 <div className="container flex w-[100%] justify-evenly">
                  
                  
                   <div className="sub-1 flex flex-col gap-3">
                     <p className=' font-semibold'>Found</p>
                     <div className="wrapper-tag flex justify-center">
   
                     <Tag label={file && file["totalValid"]} >
   
                     </Tag>
                     </div>
                   </div>
   
                  
   
                   <div className="sub-1 flex flex-col gap-3">
                     <p className=' font-semibold'>Not Found</p>
                     <div className="wrapper-tag flex justify-center">
   
                     <Tag label={file && file["totalData"]-file["totalValid"]} >
   
                     </Tag>
                     </div>
                   </div>
   
               
 
               
                   <div className="sub-1 flex flex-col gap-3">
                     <p className=' font-semibold'>Credit Consumed</p>
                     <div className="wrapper-tag flex justify-center">
   
                     <Tag label={file && file["totalValid"]} >
   
                     </Tag>
                     </div>
                   </div>
   
   
                 
   
   
   
                 </div>
 
                   
                 </div>
                 
 
               
 
   
                 
   
   
   
               </CardBody>
               <CardFooter>
   
               </CardFooter>
   
             </Card>}
   
   
   
   
   
           <div className='w-[90%] m-auto'>
             {loading ? (
               <Skeleton count={5} height={40} />
             ) : (
               <SecondTable fileId={id} />
             )}
           </div>
         </div>
   
   </>)
}  
  

function FileById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [file, setFile] = useState({});
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Api1("/api/v1/file/file/getById", "post", {
        fileId: id
      }).then(({ data }) => {
        if (data.success) {
          setFile(data.data);
          setIsLoading(false);
        }

      }).catch((err) => {
        setIsLoading(false);
        setError(err);


      })
    }
  }, [id])




  console.log("The file data is here :-");
  console.log(file)

  if(file && file["operational"] === "EmailVerification"){
    return(<>
    <EmailVerificationRenderingCard
    file={file}
    loading={loading}
    error={error}
    navigate={navigate}
    user={user}
    id={id}
    operational={"EmailVerification"}
  
    />
    </>)

  }


else{
  return(<>
  <EmailFinderRenderingCard
  file={file}
  loading={loading}
  error={error}
  navigate={navigate}
  user={user}
  id={id}
  operational={"EmailFinder"}

  />
  </>)
}

 
}

export default FileById