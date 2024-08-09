import React from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,

} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  MagnifyingGlassIcon,
  CheckIcon

} from "@heroicons/react/24/solid";





import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function MultiLevelSidebar({ RightSideState, setRightSideState }) {
  const [open, setOpen] = React.useState(0);
  const [logOutOpen,setLogoutOpen]=React.useState(false);


  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };
  const handleLogoutOpen=()=>{
    setLogoutOpen(!logOutOpen);

  }
  const navigate = useNavigate()

  return (
    <div className=" flex min-h-[130vh] flex-1">
      <Card className="h-[100%] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-4">
          <Typography variant="h5" color="blue-gray">
            Sidebar
          </Typography>
        </div>
        <List>
          <Accordion
            open={open === 1}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 1}>
              <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
                <ListItemPrefix>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Email Search
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem className={`${RightSideState === 1 ? '!bg-blue-600 !text-white' : ''
                  }`}
                  onClick={() => setRightSideState(1)}
                >
                  <ListItemPrefix>
                  </ListItemPrefix>
                  Bulk Search
                </ListItem>
                <ListItem className={`${RightSideState === 2 ? '!bg-blue-600 !text-white' : ''}`}
                  onClick={() => setRightSideState(2)}>
                  <ListItemPrefix>
                  </ListItemPrefix>
                  Single Search
                </ListItem>

              </List>
            </AccordionBody>
          </Accordion>
         
          <ListItem  onClick={()=>{
           setRightSideState(3)
          }}>
            <ListItemPrefix>
              <InboxIcon className="h-5 w-5" />
            </ListItemPrefix>
            Knowledge
            {/* <ListItemSuffix>
            <Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
          </ListItemSuffix> */}
          </ListItem>

          <ListItem onClick={()=>{
           setRightSideState(4)
          }}>
            <ListItemPrefix>
              <UserCircleIcon className="h-5 w-5" />
            </ListItemPrefix>
            Profile
          </ListItem>
        
          <ListItem onClick={
            handleLogoutOpen
          }>
            <ListItemPrefix>
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            Log Out
          </ListItem>
        </List>
      </Card>

      <Dialog open={logOutOpen} handler={handleLogoutOpen}>
        <DialogHeader>Log out</DialogHeader>
        <DialogBody>
        Are you sure you want to logout ?    
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="green"
            onClick={handleLogoutOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="red" onClick={()=>{
          


              localStorage.clear();
              location.href = "/";
              handleLogoutOpen();
  
  
            
          }}>
            <span>Log out</span>
          </Button>
        </DialogFooter>
      </Dialog>



    </div>
  );
}