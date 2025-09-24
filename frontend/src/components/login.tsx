import React, {useEffect, useState} from "react";
import logo from "../assets/logo.png"
import api, {deleteCookie, isJwtExist} from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import Alert from "./alert";


api.interceptors.response.use(
    response => response,
    error => {
        // Token expired or invalid, logout user
        if (error.response?.status === 401) {
            deleteCookie('token');
        }

        // Too many requests
        if (error.response?.status === 429) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);


function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [success, setSuccess] = useState('');

    useEffect(() => {
        document.title = "Login | LinkInPurry";
        if (isJwtExist()) navigate('/home');
    }, [navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!identifier || !password) {
            setError('Please enter both email and password');
            return;
        }

        api.post('/login', {
            identifier,
            password
        }).then(response => {
            if (response.status === 200) {
                setSuccess(response.data.message);
                setTimeout(() => {
                    navigate('/home');
                }, 2000)
            } else {
                setError(response.data.message);
            }
        }).catch(error => {
            if (error.response.status === 401) {
                setError(error.response.data.message);
            } else {
                setError('Something went wrong. Please try again later');
            }
        });
    };

    return(
        <div className="bg-white min-h-screen">
            {error && (
                <Alert
                    message={error}
                    type="error"
                    onClose={() => setError('')}
                />
            )}
            {success && (
                <Alert
                    message={success}
                    type="success"
                    onClose={() => setSuccess('')}
                />
            )}
            <div className="header">
                <button className="flex items-center w-36">
                    <Link to="/home" className="text-xs pl-4 pt-4">
                        <img src={logo} style={{ height: "auto" }} alt="logo" />
                    </Link>
                </button>
            </div>

            <div className="container sm:bg-white sm:rounded-md sm:shadow-lg mx-auto max-w-sm p-6 mt-4 sm:mt-16">
                <h1 className="text-center text-blue-800 text-4xl py-5 font-bold">Login</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="identifier" className="font-semibold">Email or Username</label>
                        <input
                            type="text"
                            placeholder="Email or Username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full h-12 mt-1 border border-gray-500 pl-4 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="font-semibold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-full bg-blue-800 text-white mt-4 py-3 font-semibold"
                    >
                        Sign In
                    </button>
                </form>

                <div className="flex items-center justify-center my-6">
                    <hr className="flex-grow border-gray-500"/>
                    <span className="px-2 text-lg">or</span>
                    <hr className="flex-grow border-gray-500"/>
                </div>

                <div className="text-md text-center mt-4">
                    New to LinkInPurry?
                    <Link to="/signup" className="ml-1 text-blue-800 font-semibold">
                        Join now
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;