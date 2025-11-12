import GuestMyBookings from './views/guest-my-bookings-view.vue';
import GuestReviewForm from './views/guest-review-form-view.vue';
import GuestCreateBooking from './views/guest-create-booking-view.vue';

export const bookingRoutes = [
    {
        path: '/guest/booking/my-list',
        name: 'guest-my-bookings',
        component: GuestMyBookings,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
    },
    {
        path: '/guest/booking/review', // Ruta simple
        name: 'guest-review-form',
        component: GuestReviewForm,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
    },
    {
        // "Lee" los IDs del "pase" (la URL)
        path: '/guest/booking/new/:propertyId/:roomId',
        name: 'guest-create-booking',
        component: GuestCreateBooking,
        meta: { requiresAuth: true, roles: ['guest'] }
    },
];