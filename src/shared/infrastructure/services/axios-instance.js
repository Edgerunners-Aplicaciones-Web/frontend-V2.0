// src/shared/infrastructure/services/axios-instance.js

import axios from "axios";

const platformApi = import.meta.env.VITE_SMARTSTAY_API_URL;

const sharedAxiosInstance = axios.create({
    baseURL: platformApi,
});

export default sharedAxiosInstance;