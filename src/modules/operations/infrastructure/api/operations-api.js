import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const TASKS_ENDPOINT = import.meta.env.VITE_TASKS_ENDPOINT_PATH;

export const operationsApi = {
    async fetchTasks(assignedTo = null) {
        const params = assignedTo ? { assignedTo: assignedTo } : {};
        const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}`, { params });
        return res.data;
    },
    async fetchTaskById(taskId) {
        const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}/${taskId}`);
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