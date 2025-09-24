import {useEffect, useState} from "react";
import bannerbg from "../assets/banner-bg.png";
import profpic from "../assets/profie-picture.png";
import { FaPlus } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import dummy from "../assets/dummy.png";
import { useParams, useNavigate, Link} from "react-router-dom";
import axios from "axios";
import {getCookie, isJwtExist} from "../api/api.ts";
import { ConnectionList } from "./connections.tsx";
import { formatDistanceToNow } from "date-fns";
import { MdOutlineEdit } from "react-icons/md";

function Profile() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [workHistory, setWorkHistory] = useState("");
    const [skills, setSkills] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const params = useParams();
    const id = params.id;
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const [feed, setFeed] = useState([]);
    const [conList, setConList] = useState([]);
    const api = axios.create({
        baseURL: "http://localhost:3000/api",
    });

    const handleOpenForm = () => {
        setIsFormOpen(true);
        api.get(`/profile/${id}`)
            .then((res) => {
                setUserName(res.data.body.username);
                setFullName(res.data.body.name);
                setWorkHistory(res.data.body.work_history);
                setSkills(res.data.body.skills);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("username", userName);
        if (profilePicture) {
            formData.append("profile_photo", profilePicture);
        }
        formData.append("name", fullName);
        formData.append("work_history", workHistory);
        formData.append("skills", skills);
    
        await api.put(`/profile/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then(async () => {
                await api.get(`/profile/${id}`)
                    .then((res) => {
                        setProfile(res.data.body);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    
        setIsFormOpen(false);
    };

    const handleRequestFollow = () => {
        api.post(`/users/requests/${id}`)
            .then(() => {
                api.get(`/profile/${id}`)
                    .then((res) => {
                        setProfile(res.data.body);
                    })
                    .catch((err) => {
                        console.log("Error fetching profile after follow request:", err);
                    });
            })
            .catch((err) => {
                console.log("Error requesting follow:", err);
            });
    };

    const handleRequestFollowCancel = () => {
        api.delete(`/users/requests/${id}`)
            .then(() => {
                api.get(`/profile/${id}`)
                    .then((res) => {
                        setProfile(res.data.body);
                    })
                    .catch((err) => {
                        console.log("Error fetching profile after follow request:", err);
                    });
            })
            .catch((err) => {
                console.log("Error requesting follow:", err);
            });
    };

    const handleDeleteConnection = () => {
        api.delete(`/users/connections/${id}`)
            .then(() => {
                api.get(`/profile/${id}`)
                    .then((res) => {
                        setProfile(res.data.body);
                    })
                    .catch((err) => {
                        console.log("Error fetching profile after follow request:", err);
                    });
            })
            .catch((err) => {
                console.log("Error requesting follow:", err);
            });
    };
    
    useEffect(() => {
        if (!isJwtExist()) {
            navigate('/login');
        }
        api.get(`/profile/${id}`)
            .then((res) => {
                console.log(res);
                setProfile(res.data.body);
            })
            .catch((err) => {
                console.log(err);
            });
        api.get("/users/connections/" + id)
            .then((res) => {
                console.log(res.data);
                setConList(res.data);
            })
            .catch((err) => {
                console.log(err);
            }); 
        api.get(`/feed/${id}`)
            .then((res) => {
                console.log(res.data);
                setFeed(res.data);
            })
            .catch((err) => {
                console.log(err);
            }); 
    }, [id, navigate]);

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
            <div className="w-full flex flex-col md:w-3/4 gap-4">
                <div className="flex flex-col justify-between bg-white sm:rounded-lg border border-gray-300 overflow-hidden">
                    <div className="">
                        <img src={bannerbg} style={{ width:"100%" }} alt="bannerng" />
                    </div>
                    <div className="-mt-32 ml-2 flex flex-row justify-between">
                        <div className="">
                            <img src={profpic} style={{ height: "200px" }} alt="profpic" />
                        </div>
                        {
                            profile.code == 4 ?
                                <button onClick={handleOpenForm} className="rounded-full p-2 hover:bg-slate-100 duration-200 text-gray-800 font-semibold text-2xl h-fit mt-36 mr-4">
                                    <MdOutlineEdit></MdOutlineEdit>
                                </button>
                            :
                                <div className=""></div>
                        }
                    </div>

                    <div className="ml-6">
                        <div className="text-2xl font-semibold">
                            {profile.name}
                        </div>
                        <div className="text-md mt-1">
                            {profile.skills}
                        </div>
                        <div className="text-sm mt-1 text-gray-500">
                            {profile.work_history}
                        </div>
                        <div className="text-sm mt-1 text-gray-500">
                            {profile.connectionsCount} connection
                            {profile.connectionsCount > 1 ? "s" : ""}
                        </div>
                    </div>
                    <div className="flex flex-row mt-3 mb-6 ml-6 gap-2">
                        {profile.code == 4 ?
                            <div className=""></div>
                            :
                            profile.code == 3 ?
                                <div className="flex flex-row gap-2">
                                    <Link to="/message">
                                        <button className="rounded-full bg-blue-700 hover:bg-blue-900 text-white font-semibold px-4 py-1">
                                            Message
                                        </button>
                                    </Link>
                                    <button onClick = {handleDeleteConnection} className="flex flex-row rounded-full border border-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 hover:text-black">
                                        <FaCheck className="text-xl my-auto mr-2"/>Following
                                    </button>
                                </div>

                                :
                                profile.code == 2 && profile.receiver == id?
                                    <button onClick={handleRequestFollowCancel} className="flex flex-row rounded-full border border-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 hover:text-black">
                                        Waiting...
                                    </button>
                                :
                                profile.code == 2 && profile.sender == id?
                                    <Link to={'/request'} className="flex flex-row rounded-full border border-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 hover:text-black">
                                        Waiting...
                                    </Link>
                                    :
                                    profile.code == 1 ?
                                        <button onClick={handleRequestFollow} className="flex flex-row rounded-full border border-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 hover:text-black">
                                            <FaPlus className="text-xl my-auto mr-2"/> Follow
                                        </button>
                                        :
                                        <button className="flex flex-row rounded-full border border-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 hover:text-black">
                                            <Link to="/login">
                                                Login to see more
                                            </Link>
                                        </button>
                        }
                    </div>
                    {isFormOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full h-fit md:max-w-2xl">
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-row">
                                        <img src={profpic} style={{ height: "80px" }} alt="profpic" />
                                        <div className="my-auto">
                                            <div className="text-xl font-semibold">
                                                {profile.name}
                                            </div>
                                            <div className="text-sm">
                                                Post to anyone
                                            </div>
                                        </div>
                                    </div>
                                    <div className="">
                                        <button onClick={handleCloseForm} className="mt-0">
                                            <IoMdClose className="text-2xl" />
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-2">
                                        <label>Username</label>
                                        <input
                                            className="p-2"
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                        <label>Full name</label>
                                        <input
                                            className="p-2"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                        <label>Work History</label>
                                        <input
                                            className="p-2"
                                            type="text"
                                            value={workHistory}
                                            onChange={(e) => setWorkHistory(e.target.value)}
                                        />
                                        <label>Skills</label>
                                        <input
                                            className="p-2"
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                        />
                                        <label>Profile Picture</label>
                                        <input
                                            className="p-2"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setProfilePicture(e.target.files[0])}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            type="submit"
                                            className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>

                <div className="">
                    {
                        profile.code != 0 ?
                        <div className="flex flex-col justify-between bg-white sm:rounded-lg border border-gray-300 overflow-hidden">
                            <div className="text-2xl font-semibold pl-6 py-4 mt-2">
                                Activity
                                <div className="text-sm text-gray-500 font-normal">
                                    {profile.connectionsCount} connection
                                    {profile.connectionsCount > 1 ? "s" : ""}
                                </div>
                            </div>
                            {feed.map((post) => (
                                <div className="flex flex-col bg-white border-t border-gray-300 p-2">
                                    <div className="">
                                        <span className="text-xs ml-2 font-semibold text-gray-500"> {profile.name}</span> 
                                        <span className="text-xs ml-2"> posted this {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <div className="p-2">
                                        {post.content}
                                    </div>
                                </div>
                            ))}

                        </div>
                        :
                        <div className=""></div>
                    }
                </div>

                {
                    <div className="flex flex-col justify-between bg-white sm:rounded-lg border border-gray-300 overflow-hidden">
                        <div className="text-2xl font-semibold pl-6 py-4 mt-2">
                            Connection
                        </div>
                        <ConnectionList isSelf={false} conList={conList}/>
                    </div>
                // :
                //     <div className=""></div>
                }

            </div>
            <div className="left-side w-full md:w-1/4 flex flex-col">
                <div className="bg-white sm:rounded-lg border border-gray-300 overflow-hidden md:sticky md:top-16">
                    <div className="overflow-hidden border-t border-gray-300">
                        <img src={dummy} style={{ width:"full" }} alt="dummy" className="mx-auto"/>
                    </div>
                </div>  
            </div>
        </div>

    )
}

export default Profile;