// src/modules/properties/infrastructure/api/properties-api.js

import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;

const ROOMS_ENDPOINT = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;
const PROPERTIES_ENDPOINT = import.meta.env.VITE_PROPERTIES_ENDPOINT_PATH;
const TASKS_ENDPOINT = import.meta.env.VITE_TASKS_ENDPOINT_PATH;

export const propertyApi = {
    // --- Property Endpoints ---
    async fetchProperties() {
        const res = await axios.get(`${API_BASE_URL}${PROPERTIES_ENDPOINT}`);
        return res.data;
    },
    async fetchPropertyById(id) {
        const res = await axios.get(`${API_BASE_URL}${PROPERTIES_ENDPOINT}/${id}`);
        return res.data;
    },
    async postProperty(data) {
        const res = await axios.post(`${API_BASE_URL}${PROPERTIES_ENDPOINT}`, data);
        return res.data;
    },
    async patchProperty(id, data) {
        const res = await axios.patch(`${API_BASE_URL}${PROPERTIES_ENDPOINT}/${id}`, data);
        return res.data;
    },
    async removeProperty(id) {
        await axios.delete(`${API_BASE_URL}${PROPERTIES_ENDPOINT}/${id}`);
    },

    // --- Room Endpoints ---
    async fetchRooms(propertyId = null) {
        const params = propertyId ? { propertyId: propertyId } : {};
        const res = await axios.get(`${API_BASE_URL}${ROOMS_ENDPOINT}`, { params });
        return res.data;
    },
    async fetchRoomById(roomId) {
        const res = await axios.get(`${API_BASE_URL}${ROOMS_ENDPOINT}/${roomId}`);
        return res.data;
    },
    async postRoom(roomData) {
        const res = await axios.post(`${API_BASE_URL}${ROOMS_ENDPOINT}`, roomData);
        return res.data;
    },
    async patchRoom(roomId, roomData) {
        const res = await axios.patch(`${API_BASE_URL}${ROOMS_ENDPOINT}/${roomId}`, roomData);
        return res.data;
    },
    async removeRoom(roomId) {
        await axios.delete(`${API_BASE_URL}${ROOMS_ENDPOINT}/${roomId}`);
    },

    // --- Task Endpoints ---
    async fetchTasks(assignedTo = null) {
        const params = assignedTo ? { assignedTo: assignedTo } : {};
        const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}`, { params });
        return res.data;
    },
    async postTask(taskData) {
        const res = await axios.post(`${API_BASE_URL}${TASKS_ENDPOINT}`, taskData);
        return res.data;
    },
    async patchTask(taskId, data) {
        const res = await axios.patch(`${API_BASE_URL}${TASKS_ENDPOINT}/${taskId}`, data);
        return res.data;
    },
    async removeTask(taskId) {
        await axios.delete(`${API_BASE_URL}${TASKS_ENDPOINT}/${taskId}`);
    }
};