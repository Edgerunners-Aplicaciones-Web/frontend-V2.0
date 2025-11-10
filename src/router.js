// src/router.js

import { createRouter, createWebHistory } from "vue-router";

// --- 1. Import Module Route Definitions ---
import authRoutes from './modules/auth/presentation/routes.js'; // Contiene /login, /register, /admin/auth/users
import dashboardRoutes from './modules/dashboard/presentation/routes.js'; // Contiene /dashboard (redirector) y /admin/dashboard, etc.
import propertyRoutes from './modules/property/presentation/routes.js'; // Contiene /admin/property/rooms, /guest/property/list, etc.
import bookingRoutes from './modules/booking/presentation/routes.js'; // Contiene /guest/booking/my-list, /guest/booking/review
import staffRoutes from './modules/staff/presentation/routes.js';
import guestRoutes from './modules/guest/presentation/routes.js';

const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');


// --- 3. Combine All Route Definitions ---
const routes = [
    // Spread routes imported from feature modules first.
    ...authRoutes,
    ...dashboardRoutes,
    ...propertyRoutes,
    ...bookingRoutes,
    ...staffRoutes,
    ...guestRoutes,

    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/:pathMatch(.*)*', // Catch-all 404
        name: 'NotFound',
        component: PageNotFound,
        meta: { title: 'Page Not Found', requiresAuth: false }
    }
];

// --- 4. Create Router Instance ---
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// --- 5. Global Navigation Guard ---
router.beforeEach((to, from, next) => {
    console.log("--- AUTH_GUARD (INICIO) ---");
    console.log("localStorage 'user_token' ES:", localStorage.getItem('user_token'));

    const isAuthenticated = !!localStorage.getItem('user_token');
    const userRole = localStorage.getItem('user_role');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles; // Roles específicos requeridos por la ruta
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    console.log(`[Global Guard] Navigating to: ${String(to.name) || to.path}, Auth: ${isAuthenticated}, Role: ${userRole}, RequiresAuth: ${requiresAuth}, RequiredRoles: ${requiredRoles}, PublicOnly: ${publicOnly}`);

    if (requiresAuth && !isAuthenticated) {
        console.log('[Global Guard] Auth required, redirecting to login.');
        next({ name: 'login' });
    } else if (publicOnly && isAuthenticated) {
        console.log('[Global Guard] PublicOnly route accessed while logged in, redirecting to dashboard.');
        next({ name: 'dashboard' });
    } else if (requiresAuth && requiredRoles && !requiredRoles.includes(userRole)) {

        console.log(`[Global Guard] Role mismatch. Required: ${requiredRoles}, User has: ${userRole}. Redirecting to dashboard.`);
        next({ name: 'dashboard' });
    } else {
        console.log('[Global Guard] Allowing navigation.');
        next();
    }
});

// --- 6. Export Router Instance ---
export default router;