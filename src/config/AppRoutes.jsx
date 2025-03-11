import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import ChatPage from "../pages/ChatPage";

const AppRoutes = () =>
{
    return <div>
        <Routes>
        <Route path="/" element={<App/>}/>
        <Route path="*" element={<h1>404 Not Found</h1>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route path='/about' element={<h1> This is the about page</h1>}/>

      </Routes>
    </div>
};

export default AppRoutes;