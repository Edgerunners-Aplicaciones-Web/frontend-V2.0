// src/modules/iam/presentation/iam-routes.js

import LoginView from "./views/login-view.vue";
import RegisterView from "./views/register-view.vue";
import AdminManageUsers from './views/admin-manage-users-view.vue';
import AdminEditUser from './views/admin-edit-user-view.vue';
import AdminAddUser from "./views/admin-add-user-view.vue";
import AdminProfile from "../../profile/presentation/views/admin-profile-view.vue";

export const iamRoutes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: {
            title: 'Sign In',
            publicOnly: true,
            requiresAuth: false
        }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: {
            title: 'Register',
            publicOnly: true,
            requiresAuth: false
        }
    },
    {
        // ¡"CAMISETA" CORREGIDA!
        path: '/admin/iam/users',
        name: 'admin-manage-users',
        component: AdminManageUsers,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        // ¡"CAMISETA" CORREGIDA!
        path: '/admin/iam/users/edit/:userId',
        name: 'admin-edit-user',
        component: AdminEditUser,
        props: true,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        // ¡"CAMISETA" CORREGIDA!
        path: '/admin/iam/users/add',
        name: 'admin-add-user',
        component: AdminAddUser,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: '/admin/profile',
        name: 'admin-profile',
        component: AdminProfile,
        meta: { requiresAuth: true, roles: ['admin'] }
    }
];