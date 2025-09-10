import "./index.css";
import { router } from "./App.tsx";
import { RouterProvider } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import AuthProvider from "./contexts/authContext.tsx";

import { register } from "swiper/element/bundle";
register();
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import {Toaster} from 'react-hot-toast'
//--------------------------------------------------------------------


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Toaster position="top-right" reverseOrder={false}/>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
