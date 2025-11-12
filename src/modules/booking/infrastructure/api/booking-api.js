import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SMARTSTAY_API_URL;
const BOOKINGS_ENDPOINT = '/bookings';
const REVIEWS_ENDPOINT = '/reviews';

/**
 * "Agente" de API: Habla directamente con el servidor (json-server).
 * No sabe nada de "Entidades" o "Armas", solo de JSON.
 */
export const bookingApi = {
    // --- Bookings ---
    async fetchAllBookings() {
        const res = await axios.get(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`);
        return res.data;
    },
    async fetchBookingsByGuestId(guestId) {
        const res = await axios.get(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`, {
            params: { guestId: guestId }
        });
        return res.data;
    },
    async fetchBookingById(bookingId) {
        const res = await axios.get(`${API_BASE_URL}${BOOKINGS_ENDPOINT}/${bookingId}`);
        return res.data;
    },
    async postBooking(bookingData) {
        const res = await axios.post(`${API_BASE_URL}${BOOKINGS_ENDPOINT}`, bookingData);
        return res.data;
    },
    async patchBooking(bookingId, bookingData) {
        const res = await axios.patch(`${API_BASE_URL}${BOOKINGS_ENDPOINT}/${bookingId}`, bookingData);
        return res.data;
    },
    async removeBooking(bookingId) {
        await axios.delete(`${API_BASE_URL}${BOOKINGS_ENDPOINT}/${bookingId}`);
    },

    // --- Reviews ---
    async postReview(reviewData) {
        const res = await axios.post(`${API_BASE_URL}${REVIEWS_ENDPOINT}`, reviewData);
        return res.data;
    },
    async fetchReviewsByBookingId(bookingId) {
        const res = await axios.get(`${API_BASE_URL}${REVIEWS_ENDPOINT}`, {
            params: { bookingId: bookingId }
        });
        return res.data;
    }
};