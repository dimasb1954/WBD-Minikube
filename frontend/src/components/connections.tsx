import { useEffect, useState } from "react";
import dummy from "../assets/dummy.png";
import axios from "axios";
import { getCookie, isJwtExist } from "../api/api";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

type Connection = {
    fromId: string,
    toId: string,
    createdAt: string,
    to: {
        fullName: string,
        profilePic: string
    }
}

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

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

function ConnectionList({isSelf, conList}: {isSelf: boolean, conList: Connection[]}) {
    const [userNetwork, setUserNetwork] = useState({id: "", connections: [""], received: [""], sent: [""]});
    const [removed, setRemoved] = useState([""]);
    const [pending, setPending] = useState([""]);
    
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
        getNetwork()
    }, [])

    function hasConnection(id: string) {
        return userNetwork.connections.includes(id);
    }

    function hasRequest(id: string) {
        return userNetwork.sent.includes(id) || userNetwork.received.includes(id) || pending.includes(id);
    }

    async function remove(toId: string) {
        await api.delete('/users/connections/' + toId)
        .catch((err) => {
            console.log(err)
        })
        setRemoved([...removed, toId]);
    }

    async function request(id: string) {
        await api.post('/users/requests/' + id)
        .then((res) => {
            console.log(res.data)
        })
        .catch((err) => {
            console.log(err);
        })
        setPending([...pending, id]);
    }

    return (
        <div className="flex flex-row gap-2 border-t border-gray-300">
            <div className="w-full">
            {
                conList.map((user) => (
                    !removed.includes(user.toId) &&
                    <div key={parseInt(user.toId)} className="flex flex-row justify-between my-4 pb-2 border-b border-gray-300">
                        <Link to={'/profile/' + user.toId} className="flex flex-row justify-start">
                            <div className="ml-4">
                                <img src={user.to.profilePic} style={{ height: "55px" }} alt="profpic" />
                            </div>
                            <div className="ml-4">
                                <div className="text-lg font-semibold">{user.to.fullName}</div>
                                <div className="text-gray-500">{format(new Date(user.createdAt), 'd MMMM yyyy')}</div>
                            </div>
                        </Link>
                        {isJwtExist() && isSelf && userNetwork.id != user.toId &&
                        <div className="">
                            <button className="rounded-full px-4 py-1 text-gray-500 font-semibold hover:bg-gray-100 mr-4"
                            onClick={() => remove(user.toId)}>
                                Remove
                            </button>
                            <button className="rounded-full px-4 py-1 border border-blue-700 bg-white text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950 mr-4">
                                <Link to="/message">
                                    Message
                                </Link>
                            </button>
                        </div>
                        }
                        {
                            !isSelf && isJwtExist() && hasConnection(user.toId) && userNetwork.id != user.toId &&
                            <div>
                            <button className="rounded-full px-4 py-1 border border-blue-700 bg-white text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950 mr-4">
                                <Link to="/message">
                                    Message
                                </Link>
                            </button>
                            </div>
                        }
                        {
                            !isSelf && isJwtExist() && hasRequest(user.toId) && userNetwork.id != user.toId &&
                            <div className="text-gray-600 font-semibold px-4 mr-4 my-2">
                                Pending
                            </div>
                        }
                        {
                            !isSelf && isJwtExist() && userNetwork.id != user.toId && !hasRequest(user.toId) && !hasConnection(user.toId) && 
                            <div>
                            <button className="rounded-full px-4 py-1 border border-blue-700 bg-white text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950 mr-4"
                            onClick={() => request(user.toId)}>
                                Connect
                            </button>
                            </div>
                        }
                    </div>
                ))
            }
            </div>
        </div>
    )
}

function Connections() {
    const [conList, setConList] = useState([])

    useEffect(() => {
        api.get("/users/connections")
        .then((res) => {
            setConList(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [])

    return(
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-4 mt-16 sm:px-8 md:px-16 lg:px-0">
            <div className="w-full flex flex-col md:w-3/4 gap-4">
                <div className="flex flex-col justify-between bg-white sm:rounded-lg border border-gray-300 overflow-hidden">
                    <div className="mx-6 my-3 text-lg">
                        Connections
                    </div>
                    <ConnectionList isSelf={true} conList={conList} />
                </div>
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

export {ConnectionList, Connections};