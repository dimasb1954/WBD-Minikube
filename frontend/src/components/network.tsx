import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import bannerbg from "../assets/banner-bg.png";
import profpic from "../assets/profie-picture.png";
import { MdGroupAdd } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import dummy from "../assets/dummy.png";
import axios from "axios";
import { IoSearch } from "react-icons/io5";

import {getCookie, isJwtExist} from "../api/api.ts";

type User = {
    id: string,
    fullName: string,
}

function Network() {
    const [userList, setUserList] = useState([])
    const [reqList, setReqList] = useState([])
    const [userNetwork, setUserNetwork] = useState({id: 0, connections: [""], received: [""], sent: [""]})
    const [search, setSearch] = useState("")

    const api = axios.create({
        baseURL: "http://localhost:3000/api",
    });

    function getUsers() {
        api.get("/users")
        .then((res) => {
            setUserList(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function getRequests() {
        api.get("/users/requests")
        .then((res) => {
            setReqList(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function getNetwork() {
        api.get("/users/network")
        .then((res) => {
            setUserNetwork(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        getUsers();
        getRequests(); 
        getNetwork();       
    }, [])

    function handleSearch(e: any) {
        setSearch(e.target.value);
    }

    async function request(id: string) {
        await api.post('/users/requests/' + id)
        .catch((err) => {
            console.log(err);
        });
        getNetwork();
    }

    function hasConnection(id: string) {
        return userNetwork.connections.includes(id);
    }

    function hasRequest(id: string) {
        return userNetwork.sent.includes(id) || userNetwork.received.includes(id);
    }

    api.interceptors.request.use(
        config => {
            const token = getCookie('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    return(
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-4 mt-16 sm:px-8 md:px-16 lg:px-0">
            <div className="left-side w-full md:w-1/4 flex flex-col">
                <div className="bg-white sm:rounded-lg border border-gray-300 overflow-hidden md:sticky md:top-16">
                    {isJwtExist() &&
                    <div>
                        <div className="p-4 pb-2">
                            Manage my network
                        </div>
                        <div className="mb-4">
                        <Link className="text-md-mt-2 text-gray-500 hover:bg-gray-100 flex py-2 duration-200" to={"/connections"}>
                            <FaPeopleGroup className="text-2xl mx-4"/> Connection
                        </Link>
                        </div>
                    </div>
                    }
                    <div className="overflow-hidden border-t border-gray-300">
                        <img src={dummy} style={{ width:"full" }} alt="dummy" className="mx-auto my-4"/>
                    </div>
                </div>  
            </div>

            <div className="w-full flex flex-col md:w-3/4 gap-4">
                    {isJwtExist() &&
                    <div className="flex flex-col bg-white sm:rounded-lg border border-gray-300 p-2">
                        <div className="flex flex-row justify-between pr-2">
                        {
                            reqList.length == 0 &&
                            <div className="my-auto ml-2">
                                There are no unanswered invitations
                            </div>
                        }
                        {
                            reqList.length != 0 &&
                            <div className="my-auto ml-2">
                                Pending invitations
                            </div>
                        }
                        
                        
                        <div className="flex flex-row">
                            <button className="rounded-md hover:bg-gray-100 font-semibold text-gray-600 p-1 duration-200">
                                <Link to="/request">
                                    Manage
                                </Link>
                            </button>
                            {reqList.length > 0 ?
                                <div className="rounded-full bg-red-600 h-min w-4 text-white font-semibold text-center text-xs -ml-2">
                                    {reqList.length}
                                </div>
                            :
                                <div className=""></div>
                            }
                        </div>
                    </div>
                    </div>
                }

                <div className="bg-white sm:rounded-lg border border-gray-300 p-4 flex flex-col">
                    <div className="focus-within:border-gray-600 flex flex-row items-center ml-0 bg-white border-2 border-gray-400 h-8 rounded-md mb-4 w-full">
                        <IoSearch className="text-xl mx-4" />
                        <input
                            placeholder="Search by name"
                            className="focus:outline-none bg-inherit w-full"
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto" style={{height: "840px"}}>
                        {
                            userList.map((user: User) => (
                                    userNetwork.id != parseInt(user.id) && (search == "" || user.fullName.toLowerCase().includes(search.toLowerCase())) &&
                                    <div key={parseInt(user.id)} className="flex flex-col justify-between bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-md hover:shadow-gray-400 duration-200" style={{height: "280px"}}>
                                    <Link to={'/profile/' + user.id} className="flex flex-col">
                                        <div className="">
                                            <img src={bannerbg} style={{ width: "100%" }} alt="bannerng" />
                                        </div>
                                        <div className="mx-auto -mt-14">
                                            <img src={profpic} style={{ height: "140px" }} alt="profpic" />
                                        </div>
                                        <div className="flex flex-col mx-auto -mt-2 px-4">
                                            <div className="font-semibold text-lg text-center">{user.fullName}</div>
                                            <div className="mt-2 text-xs text-gray-500 text-center">Based on your profile</div>
                                        </div>
                                    </Link>
                                    <div className="p-2">
                                        {isJwtExist() && !hasConnection(user.id) && !hasRequest(user.id) &&
                                        <button className="flex flex-row justify-center w-full mb-2 rounded-full border border-blue-700 text-blue-700 p-1 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950"
                                        onClick={() => request(user.id)}>
                                            <MdGroupAdd className="text-2xl mr-1"/>Connect
                                        </button>
                                        }
                                        {
                                            isJwtExist() && hasConnection(user.id) &&
                                            <Link to={'/message'} className="flex flex-row justify-center w-full mb-2 rounded-full border border-blue-700 text-blue-700 p-1 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950 duration-200"
                                            >
                                                Message
                                            </Link>
                                        }
                                        {
                                            isJwtExist() && hasRequest(user.id) &&
                                            <div className="flex flex-row justify-center w-full text-gray-600 font-semibold mb-2 p-1">
                                                Pending
                                            </div>
                                        }
                                    </div>
                                    </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Network;