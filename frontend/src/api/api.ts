import axios from "axios";

export function setCookie(name: string, value: string, hours: number) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";";
}

export function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

export function isJwtExist() {
    return !!getCookie('token');
}

export function deleteCookie(name: string) {
    if (getCookie(name)) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        return true;
    } else {
        return false;
    }
}

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        Authorization: getCookie("token") ? `Bearer ${getCookie("token")}` : undefined,
    }
});

export default api;