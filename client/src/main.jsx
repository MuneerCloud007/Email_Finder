import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ErrorPage from "./pages/ErrorPage.jsx";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import SignIn from "./components/signin/Sigin.jsx";
import SignUp from "./components/signup/Signup.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import { PaginationProvider } from "./components/dashboard/RightSide/Pagination.jsx";
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import ProtectedRoutes from './app/ProtectedRoute.jsx';
import Store from "./Store.js";
import { Provider } from 'react-redux';
import { ThemeProvider } from "@material-tailwind/react";
import FileById from './components/dashboard/File/FileById.jsx';
import RequestEmailVerification from "./pages/RequestEmailVerification.jsx";
import EmailVerify from "./pages/EmailVerify.jsx"
import ResetPassword from "./components/signin/ResetPassword.jsx"
import VerifyResetPassword from "./components/signin/VerifyResetPassword.jsx";
import EmailInbox from "./pages/Email_Inbox.jsx"
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      {
        path: "",
        element: <SignIn />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      {
        path:"/resetPassword",
        element:(
          <ResetPassword/>
        )
      },
      {
        path:"/resetpassword/verify/:id",
        element:<VerifyResetPassword/>

      },
      {
        path: "/dashboard",

        element: (
        <ProtectedRoutes>
          <Dashboard />
        </ProtectedRoutes>
        )
      },
      {
        path:"/file/:id",
        element: (
          <ProtectedRoutes>
            <FileById />
          </ProtectedRoutes>
          )

      },
      {
        path:"/emailVerify/:id",
        element:(
          <EmailVerify/>
        )
      },
      {
        path:"/request/emailVerify",
        element:(
          <RequestEmailVerification/>
        )
      },
      {
        path:"/emailInbox",
        element:(
          <EmailInbox/>
        )
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
   <ThemeProvider>
   <Provider store={Store}>
    <PaginationProvider>

      <RouterProvider router={router} />
    </PaginationProvider>
    </Provider>
    </ThemeProvider>
);
