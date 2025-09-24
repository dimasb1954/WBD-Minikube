  import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import logo from "../assets/logo.png";
import { SlLogin } from "react-icons/sl";
import { IoHomeSharp } from "react-icons/io5";
import { FaPeopleGroup } from "react-icons/fa6";
import { AiFillMessage } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import {deleteCookie, isJwtExist} from "../api/api.ts";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white text-gray-500 font-sans border-b border-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around h-12">
          <div className="flex flex-row items-center">
            {/* logo */}
            <button className="flex items-center">
              <Link to="/home" className="text-xs">
                <img src={logo} style={{ height: "40px" }} alt="logo" />
              </Link>
            </button>

            {/* search */}
            <div className="focus:outline-blue-700 flex flex-row items-center justify-center ml-0 bg-blue-50 h-8 rounded-md">
              <IoSearch className="text-xl mx-4" />
              <input
                placeholder="Search"
                className="focus:outline-none bg-inherit"
              ></input>
            </div>
          </div>

          {/* menu desktop*/}
          {/* Home button */}
          <div className="ml-0 hidden md:block">
            <div className="flex items-baseline space-x-16">
              <button className="mx-auto flex flex-col items-center justify-center hover:text-black duration-200">
                <Link to="/home" className="text-xs">
                  <IoHomeSharp className="text-2xl mx-auto" />
                  Home
                </Link>
              </button>
              {/* My Network button */}
              <button className="mx-auto flex flex-col items-center justify-center hover:text-black duration-200">
                <Link to="/network" className="text-xs">
                  <FaPeopleGroup className="text-2xl mx-auto" />
                  My Network
                </Link>
              </button>
                {/* Messaging button */}
              <button className="mx-auto flex flex-col items-center justify-center hover:text-black duration-200">
                <Link to="/message" className="text-xs">
                  <AiFillMessage className="text-2xl mx-auto" />
                  Messaging
                </Link>
              </button>
                {/* Notification button */}
              {isJwtExist() ?
                (<button className="mx-auto flex flex-col items-center justify-center hover:text-black duration-200">
                  <Link to="/notification" className="text-xs">
                    <IoIosNotifications className="text-2xl mx-auto" />
                    Notification
                  </Link>
                </button>)
                : null
              }
              {isJwtExist() ?
                  (<button className="mx-auto flex flex-col items-center justify-center hover:text-black duration-200">
                    <Link to="/login" className="text-xs">
                      <IoIosLogOut  className="text-2xl mx-auto" />
                      {deleteCookie('token')}
                      Logout
                    </Link>
                  </button>)
                      :

                (<button className="mx-auto flex flex-col items-center justify-center hover:text-black">
                <Link to="/login" className="text-xs">
                <SlLogin className="text-xl mx-auto" />
                Login
                </Link>
                </button>)}

            </div>
          </div>

          {/* hamburger */}
          <div className="md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-10 transition-transform transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-700 text-xl"
        >
          &times;
        </button>
        <div className="px-6 pt-8 space-y-6">
          <Link
            to="/"
            className="block hover:text-black px-3 py-2 rounded-md"
          >
            Home
          </Link>
          <Link
            to="/network"
            className="block hover:text-black px-3 py-2 rounded-md"
          >
            Network
          </Link>
          <Link
            to="/message"
            className="block hover:text-black px-3 py-2 rounded-md"
          >
            Message
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
