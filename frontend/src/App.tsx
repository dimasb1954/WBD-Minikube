import React from "react"

import Navbar from "./components/navbar";
import Home from "./components/home";
import Login from "./components/login";
import Message from "./components/message";
import Network from "./components/network";
import Signup from "./components/signup";
import Profile from "./components/profile"
import {Request} from "./components/request"
import {Connections} from "./components/connections";
import "./index.css"
// Get notification permission
import "./hooks/sw.ts"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation} from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppWithNavbar />
      </Router>
    </QueryClientProvider>
  );
};

const AppWithNavbar: React.FC = () => {
  const location = useLocation(); 
    const hideNavbarRoutes = ["/login", "/signup"];

  return (
    <React.Fragment>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/message" element={<Message />} />
        <Route path="/network" element={<Network />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile">
          <Route index element={<Navigate to="/home" replace />} />
          <Route path=":id" element={<Profile />} />
        </Route>
        <Route path="/request" element={<Request />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </React.Fragment>
  );
};

export default App;