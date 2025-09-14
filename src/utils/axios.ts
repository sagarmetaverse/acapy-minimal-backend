import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.ACAPY_ADMIN_URL || 'http://localhost:8021',
    headers: {
        'Content-Type': 'application/json',
    },
})

export default axiosInstance;