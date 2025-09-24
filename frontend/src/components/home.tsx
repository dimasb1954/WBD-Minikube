import {useEffect, useState} from "react";
import bannerbg from "../assets/banner-bg.png";
import profpic from "../assets/profie-picture.png";
import dummy from "../assets/dummy.png";
import { Link } from "react-router-dom";
import { MdGroupAdd } from "react-icons/md";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { useNavigate} from "react-router-dom";
import api, {getCookie, isJwtExist} from "../api/api.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
// import { formatDistanceToNow } from "date-fns";
// Get notification permission
import "../hooks/sw.ts"

type feedQuery = {
    limit?: number;
    cursor?: string;
}

type Post = {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        fullName: string;
        profilePic: string;
        connectionsCount: number;
    }
}

type Recommendation = {
    id: string;
    fullName: string;
    skills: string;
    degree: string;
}


function Home() {
    const navigate = useNavigate();
    const [isFormOpenNewFeed, setIsFormOpenNewFeed] = useState(false);
    const [newFeedContent, setNewFeedContent] = useState("");
    const [isFormOpenEditFeed, setIsFormOpenEditFeed] = useState(false);
    const [editFeedContent, setEditFeedContent] = useState("");
    const [idPost, setIdPost] = useState("");
    const [recomSecond, setRecomSecond] = useState([]);
    const {ref, inView} = useInView();
    const limit = 10;

    const handleOpenNewFeed = () => {
        setIsFormOpenNewFeed(true);
    };

    const handleCloseNewFeed = () => {
        setIsFormOpenNewFeed(false);
    };

    const handleSubmitNewFeed = async (e: any) => {
        e.preventDefault();
        await api.post(`/feed`, {content: newFeedContent}).catch((err) => {console.log(err);});
        setNewFeedContent("");
        setIsFormOpenNewFeed(false);
        refetch();
    };

    const handleOpenEditFeed = (postId: string) => {
        setIsFormOpenEditFeed(true);
        setIdPost(postId);
        api.get(`/feed/post/${parseInt(postId)}`)
            .then((res) => {
                setEditFeedContent(res.data['body']['content']);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCloseEditFeed = () => {
        setIsFormOpenEditFeed(false);
    };

    const handleSubmitEditFeed = async (e: any) => {
        e.preventDefault();
        await api.put(`/feed/${idPost}`, {content: editFeedContent});
        setNewFeedContent("");
        setIsFormOpenEditFeed(false);
        refetch();
    };

    const handleDeleteFeed = async (postId: string) => {
        await api.delete(`/feed/${parseInt(postId)}`).then();
        refetch();
    };

    const feeds = async ({ limit, cursor }: feedQuery) => {
        const res = await api.get("/feed", {
            params: { limit, cursor },
        });
        return res.data;
    };

    const {
        data,
        error,
        hasNextPage,
        fetchNextPage,
        isFetching,
        isFetchingNextPage,
        isSuccess,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feeds'],
        queryFn: ({ pageParam = "" }) => feeds({ limit: limit, cursor: pageParam as string }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
            return lastPage?.body.cursor;
        }
    })

    if (error) {
        console.log(error);
    }

    useEffect (() => {
        if (!isJwtExist()) {
            navigate("/login");
        } else {
            if (inView && hasNextPage) {
                fetchNextPage();
            }
        }
    }, [inView, hasNextPage, fetchNextPage, navigate]);

    useEffect (() => {
        api.get("/users/recommendation")
        .then((res) => {
            setRecomSecond(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [])

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
                <button className="bg-white sm:rounded-lg border border-gray-300 overflow-hidden text-left">
                    <Link to={`/profile/${data?.pages.at(0).body.profile.id}`}>
                        <div className="">  
                            <img src={bannerbg} style={{ width:"100%", height:"60px" }} alt="bannerng" />
                        </div>
                        <div className="-mt-12 ml-2">
                            <img src={profpic} style={{ height: "100px" }} alt="profpic" />
                        </div>
                        <div className="px-4 mb-4">
                            <div className="text-xl font-semibold -mt-2">
                                {data?.pages.at(0).body.profile.fullName}
                            </div>
                            <div className="text-xs mt-1">
                                {data?.pages.at(0).body.profile.skills}
                            </div>
                            <div className="text-xs mt-1 font-semibold">
                                {data?.pages.at(0).body.profile.workHistory}
                            </div>
                        </div>
                    </Link>
                </button>
                <div className="bg-white sm:rounded-lg border border-gray-300 mt-2 p-4">
                    <Link to="/network" className="text-xs">
                        <div className="flex flex-row">
                            <div className="flex flex-col w-5/6">
                                <div className="font-semibold">
                                    Connection
                                </div>
                                <div className="">
                                    Expand your network
                                </div>
                            </div>
                            <div className="w-1/6">
                                <MdGroupAdd className="text-xl py-auto" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="w-1/2 flex flex-col md:w-2/3">
                <div className="add-feed flex flex-row bg-white sm:rounded-lg border border-gray-300 p-2 pr-4">
                    <div className="w-20 my-auto">
                        <Link to={`/profile/${data?.pages.at(0).body.profile.id}`}>
                            <img src={profpic} style={{ height: "65px" }} alt="profpic" />
                        </Link>
                    </div>
                    <button onClick={handleOpenNewFeed} className="w-full rounded-full border border-gray-400 hover:bg-gray-100 duration-200 h-12 pl-4 my-auto font-semibold text-left text-gray-700 text-sm">
                        Start a post
                    </button>
                </div>

                {isFormOpenNewFeed && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-4/5 md:max-w-2xl">
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row">
                                    <img src={profpic} style={{ height: "80px" }} alt="profpic" />
                                    <div className="my-auto">
                                        <div className="text-xl font-semibold">
                                            {data?.pages.at(0).body.profile.fullName}
                                        </div>
                                        <div className="text-sm">
                                            Post to anyone
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <button onClick={handleCloseNewFeed} className="mt-0">
                                        <IoMdClose className="text-2xl"/>
                                    </button>
                                </div>

                            </div>
                            <form onSubmit={handleSubmitNewFeed}>
                                <textarea
                                    className="w-full p-2 focus:outline-none"
                                    rows={14}
                                    maxLength={280}
                                    placeholder="What's on your mind?"
                                    value={newFeedContent}
                                    onChange={(e) => setNewFeedContent(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="submit"
                                        className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 duration-200"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isFormOpenEditFeed && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-4/5 md:max-w-2xl">
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row">
                                    <img src={profpic} style={{ height: "80px" }} alt="profpic" />
                                    <div className="my-auto">
                                        <div className="text-xl font-semibold">
                                            {data?.pages.at(0).body.profile.fullName}
                                        </div>
                                        <div className="text-sm">
                                            Edit your Post

                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <button onClick={handleCloseEditFeed} className="mt-0">
                                        <IoMdClose className="text-2xl"/>
                                    </button>
                                </div>

                            </div>
                            <form onSubmit={handleSubmitEditFeed}>
                                <textarea
                                    className="w-full p-2 focus:outline-none"
                                    rows={14}
                                    maxLength={280}
                                    value={editFeedContent}
                                    onChange={(e) => setEditFeedContent(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="submit"
                                        className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 duration-200"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center my-1">
                    <hr className="flex-grow border-gray-400" />
                    <span className="mx-2 text-xs ">Filter by :</span>
                    <span className="pr-4 text-xs font-semibold">Latest</span>
                </div>
                <div className="feed-card flex flex-col gap-2">
                    {isSuccess && data?.pages.map((page) =>
                        page.body.feeds.map( (post: Post, index: number) =>
                        (page.body.feeds.length == index + 1 &&
                        <div ref={ref} key={parseInt(post.id)} className="flex flex-col bg-white sm:rounded-lg border border-gray-300 p-2">
                            <div className="flex flex-row justify-between">
                                <Link to={`/profile/${post.user.id}`}> 
                                    <div className="flex flex-row">
                                        <div className="w-16 my-auto">
                                            <img src={profpic} style={{height: "65px"}} alt="profpic"/>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <span className="font-semibold text-sm hover:text-blue-700 duration-200">{post.user.fullName}</span>
                                            <span className="text-xs text-gray-500">{post.user.connectionsCount} connection{post.user.connectionsCount > 1 ? "s" : ""}</span>
                                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                                {data?.pages.at(0).body.profile.username === post.user.username && (
                                    <div className="option flex flex-row">
                                        <button onClick={() => handleOpenEditFeed(post.id)}
                                            className="flex items-center justify-center text-xl mr-2 rounded-full hover:bg-gray-100 h-8 w-8 duration-200">
                                            <MdOutlineModeEditOutline />
                                        </button>
                                        <button onClick={() => handleDeleteFeed(post.id)}
                                            className="flex items-center justify-center text-xl mr-2 rounded-full hover:bg-gray-100 h-8 w-8 duration-200">
                                            <MdDelete />
                                        </button>

                                    </div>
                                )}

                            </div>
                            <div className="p-2 break-words">
                                {post.content}
                            </div>
                        </div>) ||
                        (page.body.feeds.length != index + 1 &&
                        <div key={parseInt(post.id)} className="flex flex-col bg-white sm:rounded-lg border border-gray-300 p-2">
                            <div className="flex flex-row justify-between">
                                <Link to={`/profile/${post.user.id}`}> 
                                    <div className="flex flex-row">
                                        <div className="w-16 my-auto">
                                            <img src={profpic} style={{height: "65px"}} alt="profpic"/>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <span className="font-semibold text-sm hover:text-blue-700 duration-200">{post.user.fullName}</span>
                                            <span className="text-xs text-gray-500">{post.user.connectionsCount} connection{post.user.connectionsCount > 1 ? "s" : ""}</span>
                                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                                {data?.pages.at(0).body.profile.username === post.user.username && (
                                    <div className="option flex flex-row">
                                        <button onClick={() => handleOpenEditFeed(post.id)}
                                            className="flex items-center justify-center text-xl mr-2 rounded-full hover:bg-gray-100 h-8 w-8 duration-200">
                                            <MdOutlineModeEditOutline />
                                        </button>
                                        <button onClick={() => handleDeleteFeed(post.id)}
                                            className="flex items-center justify-center text-xl mr-2 rounded-full hover:bg-gray-100 h-8 w-8 duration-200">
                                            <MdDelete />
                                        </button>

                                    </div>
                                )}

                            </div>
                            <div className="p-2 break-words">
                                {post.content}
                            </div>
                        </div>)
                    ))}
                    {(isFetching || isFetchingNextPage) && <div>Loading...</div>}
                </div>
            </div>

            <div className="w-1/3 right-side hidden lg:block">
                {recomSecond.length != 0 &&
                <div className="bg-white sm:rounded-lg border border-gray-300 p-2 mb-2">
                    <span className="font-semibold p-2">Add to your feed</span>
                    {recomSecond.map((recom : Recommendation) => (
                        <div className="flex flex-col bg-white">
                            <div className="flex flex-row justify-between">
                                <Link to={`/profile/${recom.id}`}> 
                                    <div className="flex flex-row">
                                        <div className="w-16 my-auto">
                                            <img src={profpic} style={{height: "65px"}} alt="profpic"/>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="font-semibold text-sm hover:text-blue-700">{recom.fullName}</span>
                                                <span className="text-sm text-gray-500">{recom.degree}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{recom.skills}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>}
                <div className="bg-white sm:rounded-lg border border-gray-300 overflow-hidden sticky top-16">
                    <img src={dummy} style={{ width:"full" }} alt="dummy" />
                </div>
            </div>
        </div>
    )
}

export default Home;