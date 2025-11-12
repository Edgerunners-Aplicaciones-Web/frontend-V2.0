// src/modules/analytics/presentation/analytics-routes.js

import AdminDashboard from './views/admin-dashboard-view.vue';
import StaffDashboard from './views/staff-dashboard-view.vue';
import GuestDashboard from './views/guest-dashboard-view.vue';

export const analyticsRoutes = [
    {
        path: '/dashboard',
        name: 'dashboard',
        beforeEnter: (to, from, next) => {
            const userRole = localStorage.getItem('user_role');
            console.log('[Router Guard /dashboard] Role:', userRole);

            if (!userRole) {
                next({ name: 'login' });
                return;
            }
            switch (userRole) {
                case 'admin':
                    next({ name: 'admin-dashboard' });
                    break;
                case 'staff':
                    next({ name: 'staff-dashboard' });
                    break;
                case 'guest':
                    next({ name: 'guest-dashboard' });
                    break;
                default:
                    localStorage.clear();
                    next({ name: 'login' });
            }
        },
        meta: { requiresAuth: true }
    },

    // --- Rutas Específicas del Dashboard (Lógica idéntica a v1) ---
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: '/staff/dashboard',
        name: 'staff-dashboard',
        component: StaffDashboard,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
    {
        path: '/guest/dashboard',
        name: 'guest-dashboard',
        component: GuestDashboard,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
    },
];