import { useEffect, useState } from "react";
import dummy from "../assets/dummy.png";
import axios from "axios";
import { getCookie, isJwtExist } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { format } from 'date-fns';

type Request = {
    fromId: string,
    toId: string,
    createdAt: string,
    from: {
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

function RequestList({reqList}: {reqList: Request[]}) {
    const [resolved, setResolved] = useState([""]);

    async function ignore(fromId: string, toId: string) {
        await api.delete('/users/requests?from=' + fromId + "&to=" + toId)
        .catch((err) => {
            console.log(err)
        });
        setResolved([...resolved, fromId]);
    }

    async function accept(fromId: string) {
        await api.put('/users/connections/' + fromId)
        .catch((err) => {
            console.log(err)
        });
        setResolved([...resolved, fromId]);
    }

    return (
        <div className="flex flex-row gap-2 border-t border-gray-300">
            <div className="w-full">
            {
                reqList.map((user) => (
                    !resolved.includes(user.fromId) &&
                    <div key={parseInt(user.fromId)} className="flex flex-row justify-between my-4 pb-2 border-b border-gray-300">
                        <Link to={'/profile/' + user.fromId} className="flex flex-row justify-start">
                            <div className="ml-4">
                                <img src={user.from.profilePic} style={{ height: "55px" }} alt="profpic" />
                            </div>
                            <div className="ml-4">
                                <div className="text-lg font-semibold">{user.from.fullName}</div>
                                <div className="text-gray-500">{format(new Date(user.createdAt), 'd MMMM yyyy')}</div>
                            </div>
                        </Link>
                        <div className="">
                            <button className="rounded-full px-4 py-1 text-gray-500 font-semibold hover:bg-gray-100 mr-4"
                            onClick={() => ignore(user.fromId, user.toId)}>
                                Ignore
                            </button>
                            <button className="rounded-full px-4 py-1 border border-blue-700 bg-white text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-950 hover:border-blue-950 mr-4"
                            onClick={() => accept(user.fromId)}>
                                Accept
                            </button>
                        </div>
                    </div>
                ))
            }
            </div>
        </div>
    )
}

function Request() {
    const navigate = useNavigate()
    const [reqList, setReqList] = useState([])

    useEffect(() => {
        if (!isJwtExist()) {
            navigate('/login');
        } else {
            api.get("/users/requests")
            .then((res) => {
                setReqList(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }, [navigate])

    return(
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-4 mt-16 sm:px-8 md:px-16 lg:px-0">
            <div className="w-full flex flex-col md:w-3/4 gap-4">
                <div className="flex flex-col justify-between bg-white sm:rounded-lg border border-gray-300 overflow-hidden">
                    <div className="ml-6 mt-2">
                        <div className="text-lg">
                            Manage invitations
                        </div>
                        <div className="text-sm mt-1 border-b-2 border-green-700 text-green-700 font-semibold max-w-fit text-center p-2">
                            Received
                        </div>
                    </div>
                    <RequestList reqList={reqList} />
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

export {RequestList, Request};