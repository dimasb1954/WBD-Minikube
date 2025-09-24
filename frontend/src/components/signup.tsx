import React, {useEffect, useState} from "react";
import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Alert from "./alert.tsx";
import axios from "axios";
import api, {deleteCookie, isJwtExist} from "../api/api.ts";


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid, logout user
            deleteCookie('token');
        }
        return Promise.reject(error);
    }
);

function Signup() {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = "Sign Up | LinkInPurry";
        if (isJwtExist()) navigate('/home');
    }, [navigate]);
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email !== '';
    };

    const validateUsername = (username: string) => {
       return !validateEmail(username) && username !== '';
    }

    const validateName = (name: string) => {
        return !validateEmail(name) && name !== '';
    }

    const validatePassword = (password: string) => {
        return password.length >= 6 && /\d/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password);
    }

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [fullName, setFullName] = useState('');
    const [nameError, setNameError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        document.title = "Sign Up | LinkInPurry";
    });

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!validateUsername(username)) {
            setUsernameError('Please enter a valid username');
            valid = false;
        } else {
            setUsernameError('');
        }

        if (!validateName(fullName)) {
            setNameError('Please enter a valid name');
            valid = false;
        } else {
            setNameError('');
        }

        if (!validatePassword(password)) {
            setPasswordError('Password must be at least 6 characters long, contain at least one number, one lowercase letter, and one uppercase letter');
            valid = false;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            valid = false;
        } else {
            setConfirmPasswordError('');
        }

        if (valid) {
            api.post('/register', {
                email,
                password,
                username,
                fullName
            }).then((response) => {
                if (response.status === 201) {
                    setSuccess('Account created successfully');
                    setTimeout(() => {
                        navigate('/home');
                    }, 2000);
                } else {
                    setError(response.data.message);
                }
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    setError(
                        error.response?.data?.message ||
                        'An unexpected error occurred. Please try again.'
                    );
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            });
        }
    };

    return (
        <div className="bg-white sm:bg-inherit min-h-screen">
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
                <button className="flex items-center w-32 sm:w-48">
                    <Link to="/home" className="text-xs pl-4 pt-4">
                        <img src={logo} style={{ height: "auto" }} alt="logo" />
                    </Link>
                </button>
            </div>

            <div className="text-center text-2xl font-semibold lg:text-3xl lg:font-normal mt-4 mb-8">Join LinkInPurry now - it's free!</div>

            <div className="container sm:bg-white mx-auto max-w-md p-6">
                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label htmlFor="email" className="font-semibold">Email <span className="text-red-600">*</span></label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                            required
                        />
                        {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="font-semibold">Username <span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                            required
                        />
                        {usernameError && <div className="text-red-500 text-sm">{usernameError}</div>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="Full Name" className="font-semibold">Full Name <span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                            required
                        />
                        {nameError && <div className="text-red-500 text-sm">{nameError}</div>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="font-semibold">Password <span className="text-red-600">*</span></label>
                        <div className="relative">
                            <input
                                type={isPasswordShown ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordShown(!isPasswordShown)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                                {isPasswordShown ? "Hide" : "Show"}
                            </button>
                        </div>
                        {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="font-semibold">Confirm Password <span
                            className="text-red-600">*</span></label>
                        <div className="relative">
                            <input
                                type={isConfirmPasswordShown ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-10 mt-1 border border-gray-500 pl-4 rounded-md"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                                {isConfirmPasswordShown ? "Hide" : "Show"}
                            </button>
                        </div>
                        {confirmPasswordError && <div className="text-red-500 text-sm">{confirmPasswordError}</div>}

                    </div>
                    <button type="submit"
                            className="w-full rounded-full bg-blue-800 text-white mt-4 py-3 font-semibold">
                        Continue
                    </button>
                </form>

                <div className="flex items-center justify-center my-6">
                    <hr className="flex-grow border-gray-500"/>
                    <span className="px-2 text-lg">or</span>
                    <hr className="flex-grow border-gray-500"/>
                </div>

                <div className="text-md text-center">
                    Already on LinkInPurry?
                    <Link to="/login" className="ml-1 text-blue-800 font-semibold">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Signup;