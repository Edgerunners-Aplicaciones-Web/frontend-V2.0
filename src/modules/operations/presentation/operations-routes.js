// src/modules/operations/presentation/operations-routes.js

import StaffTaskList from './views/staff-task-list-view.vue';

export const operationsRoutes = [
    {
        path: '/staff/operations/tasks',
        name: 'staff-task-list',
        component: StaffTaskList,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
];