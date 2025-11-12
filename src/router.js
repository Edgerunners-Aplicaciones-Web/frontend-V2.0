import { createRouter, createWebHistory } from "vue-router";

// --- 1. Importa a TODOS tus "Equipos" (Módulos) ---
import { iamRoutes } from "./modules/iam/presentation/iam-routes.js";
import { analyticsRoutes } from "./modules/analytics/presentation/analytics-routes.js";
import { propertyRoutes } from "./modules/property/presentation/property-routes.js";
import { operationsRoutes } from "./modules/operations/presentation/operations-routes.js";
import { bookingRoutes } from "./modules/booking/presentation/booking-routes.js";
// (Añadí bookingRoutes asumiendo que el archivo se llama 'booking-routes.js')

const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

// --- 3. Combina TODAS las rutas en una sola "Alineación" ---
const routes = [
    // ¡Aquí está la "química"!
    ...iamRoutes,
    ...analyticsRoutes,
    ...propertyRoutes,
    ...operationsRoutes,
    ...bookingRoutes,

    {
        path: '/',
        redirect: '/login' // Redirige la raíz a login
    },
    {
        path: '/:pathMatch(.*)*', // "Atrapa-todo" 404
        name: 'NotFound',
        component: PageNotFound,
        meta: { title: 'Page Not Found', requiresAuth: false }
    }
];

// --- 4. Crea el "Estadio" (Router) ---
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// --- 5. El "Guardia" (Ego Jinpachi) que revisa cada "pase" ---
router.beforeEach((to, from, next) => {
    console.log("--- AUTH_GUARD (INICIO) ---");
    console.log("localStorage 'user_token' ES:", localStorage.getItem('user_token'));

    const isAuthenticated = !!localStorage.getItem('user_token');
    const userRole = localStorage.getItem('user_role');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles; // Roles específicos
    const publicOnly = to.matched.some(record => record.meta.publicOnly);

    console.log(`[Global Guard] Navegando a: ${String(to.name) || to.path}, Auth: ${isAuthenticated}, Role: ${userRole}, RequiresAuth: ${requiresAuth}, RequiredRoles: ${requiredRoles}, PublicOnly: ${publicOnly}`);

    if (requiresAuth && !isAuthenticated) {
        console.log('[Global Guard] Auth required, redirecting to login.');
        next({ name: 'login' });
    } else if (publicOnly && isAuthenticated) {
        console.log('[Global Guard] PublicOnly route accessed while logged in, redirecting to dashboard.');
        next({ name: 'dashboard' });
    } else if (requiresAuth && requiredRoles && !requiredRoles.includes(userRole)) {
        console.log(`[Global Guard] Role mismatch. Required: ${requiredRoles}, User has: ${userRole}. Redirecting to dashboard.`);
        next({ name: 'dashboard' }); // Te regresa a tu "campo" seguro
    } else {
        console.log('[Global Guard] Allowing navigation.');
        next();
    }
});

// --- 6. Exportar el "Estadio" ---
export default router;