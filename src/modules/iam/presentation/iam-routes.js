// src/iam/presentation/iam-routes.js
import LoginView from "./views/login-view.vue";
import RegisterView from "./views/register-view.vue";
import AdminManageUsers from './views/admin-manage-users-view.vue';
import AdminEditUser from './views/admin-edit-user-view.vue';
import AdminAddUser from "./views/admin-add-user-view.vue";

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
            title: 'Sign Up',
            publicOnly: true,
            requiresAuth: false
        }
    },
    {
        path: '/admin/iam/users',
        name: 'admin-manage-users',
        component: AdminManageUsers,
        meta: {
            title: 'Manage Users',
            requiresAuth: true,
            roles: ['admin']
        }
    },
    {
        path: '/admin/iam/users/add',
        name: 'admin-add-user',
        component: AdminAddUser,
        meta: {
            title: 'Add User',
            requiresAuth: true,
            roles: ['admin']
        }
    },
    {
        path: '/admin/iam/users/edit/:userId',
        name: 'admin-edit-user',
        component: AdminEditUser,
        props: true,
        meta: {
            title: 'Edit User',
            requiresAuth: true,
            roles: ['admin']
        }
    }
];