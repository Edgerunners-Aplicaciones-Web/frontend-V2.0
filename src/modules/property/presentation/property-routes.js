// src/modules/property/presentation/property-routes.js

import AdminManageRooms from './views/AdminManageRooms.view.vue';
import GuestRoomList from './views/GuestRoomList.view.vue';
import StaffRoomCleaningList from './views/StaffRoomCleaningList.view.vue';
import StaffTaskList from './views/StaffTaskList.view.vue';

export default [
    {
        path: '/admin/property/rooms',
        name: 'admin-manage-rooms',
        component: AdminManageRooms,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        // Renombrado desde '/guest/property/list'
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