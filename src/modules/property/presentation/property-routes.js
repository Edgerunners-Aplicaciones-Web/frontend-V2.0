// src/modules/property/presentation/property-routes.js

import AdminManageRooms from './views/admin-manage-rooms-view.vue';
import GuestRoomList from './views/guest-room-list-view.vue';
import StaffRoomCleaningList from './views/staff-room-cleaning-list-view.vue';
import StaffTaskList from './views/staff-task-list.view.vue';

export const propertyRoutes = [
    {
        path: '/admin/property/rooms',
        name: 'admin-manage-rooms',
        component: AdminManageRooms,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: "/guest/rooms",
        name: "guest-rooms-list",
        component: GuestRoomList,
        meta: { requiresAuth: true, roles: ['guest', 'admin'] }
    },
    {
        path: '/staff/property/cleaning',
        name: 'staff-room-cleaning',
        component: StaffRoomCleaningList,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
    {
        path: '/staff/property/tasks',
        name: 'staff-task-list',
        component: StaffTaskList,
        meta: { requiresAuth: true, roles: ['staff', 'admin'] }
    },
];