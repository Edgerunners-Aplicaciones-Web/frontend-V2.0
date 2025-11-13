// src/modules/properties/application/store/properties.store.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Importar Repositorio (Inyección de Dependencia)
import { PropertyApiRepository } from '../../infrastructure/repositories/property-api.repository.js';

// Importar Casos de Uso y Consultas (Queries)
// (Para un store más limpio, creamos Queries para las lecturas)
import { CreateRoomUseCase } from '../create-room.usecase.js';
import { UpdateRoomUseCase } from '../update-room.usecase.js';
import { DeleteRoomUseCase } from '../delete-room.usecase.js';
import { CreateTaskUseCase } from '../create-task.usecase.js';
import { UpdateTaskStatusUseCase } from '../update-task-status.usecase.js';

// --- Inyección de Dependencias Manual ---
const propertyRepository = new PropertyApiRepository();
const createRoomUseCase = new CreateRoomUseCase(propertyRepository);
const updateRoomUseCase = new UpdateRoomUseCase(propertyRepository);
const deleteRoomUseCase = new DeleteRoomUseCase(propertyRepository);
const createTaskUseCase = new CreateTaskUseCase(propertyRepository);
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(propertyRepository);

const getRoomListQuery = (propertyId = null) => propertyRepository.getRooms(propertyId);
const getPropertyListQuery = () => propertyRepository.getProperties();
const getTaskListQuery = (staffId = null) => propertyRepository.getTasks(staffId);
const getTaskStatsQuery = (staffId, period, t) => {
    console.warn("getTaskStatsQuery no implementado en store, usar composable v1");
    return { kpi: {}, chartData: {} };
};


export const usePropertyStore = defineStore('property', () => {
    // --- State ---
    const rooms = ref([]);
    const properties = ref([]);
    const tasks = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // --- Getters (Computeds) ---
    const availableRooms = computed(() => rooms.value.filter(r => r.isAvailable()));
    const cleaningRooms = computed(() => rooms.value.filter(r => r.isCleaning()));

    const enrichedRooms = computed(() => {
        if (!rooms.value.length || !properties.value.length) return rooms.value;
        return rooms.value.map(room => {

            const property =
                properties.value.find(
                    p => p.id === room.propertyId
                );

            return {
                ...room,
                propertyName: property?.name || 'Hotel Desconocido'
            };
        });
    });

    // --- Actions (Mutations) ---
    async function fetchAllData() {
        loading.value = true;
        error.value = null;
        try {
            const [roomsData, propertiesData, tasksData] = await Promise.all([
                getRoomListQuery(),
                getPropertyListQuery(),
                getTaskListQuery() // Tareas de todos
            ]);
            rooms.value = roomsData || [];
            properties.value = propertiesData || [];
            tasks.value = tasksData || [];
        } catch (e) {
            error.value = e.message;
            toast.add({ severity: 'error', summary: 'Error de Carga', detail: e.message, life: 3000 });
        } finally {
            loading.value = false;
        }
    }

    async function fetchStaffData(staffId) {
        loading.value = true;
        error.value = null;
        try {
            const [roomsData, tasksData] = await Promise.all([
                getRoomListQuery(),
                getTaskListQuery(staffId)
            ]);
            rooms.value = roomsData || [];
            tasks.value = tasksData || [];
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    // Acción para cargar datos de Guest (Usado por Guest)
    async function fetchGuestData() {
        loading.value = true;
        error.value = null;
        try {
            const [roomsData, propertiesData] = await Promise.all([
                getRoomListQuery(), // Guest ve todas las habitaciones (para filtrar)
                getPropertyListQuery() // Guest ve todos los hoteles (para filtrar)
            ]);
            // Filtramos solo las disponibles en el getter 'availableRooms'
            rooms.value = roomsData || [];
            properties.value = propertiesData || [];
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    // --- Acciones de Casos de Uso (Escritura) ---

    async function createRoom(roomData) {
        loading.value = true;
        await createRoomUseCase.execute(roomData);
        await fetchAllData(); // Recargar
    }

    async function updateRoom(roomId, roomData) {
        loading.value = true;
        await updateRoomUseCase.execute(roomId, roomData);
        await fetchAllData(); // Recargar
    }

    async function deleteRoom(roomId) {
        loading.value = true;
        await deleteRoomUseCase.execute(roomId);
        await fetchAllData(); // Recargar
    }

    async function createTask(taskData) {
        loading.value = true;
        await createTaskUseCase.execute(taskData);
        await fetchStaffData(taskData.assignedTo); // Recargar
    }

    async function updateTaskStatus(taskId, newStatus, staffId) {
        loading.value = true;
        await updateTaskStatusUseCase.execute(taskId, newStatus);
        await fetchStaffData(staffId); // Recargar
    }

    console.log('propertyStore.properties inicial:', getPropertyListQuery());
    console.log('propertyStore.rooms inicial:', getRoomListQuery());

    return {
        // State
        rooms,
        properties,
        tasks,
        loading,
        error,
        // Getters
        availableRooms,
        cleaningRooms,
        enrichedRooms,
        // Actions
        fetchAllData,
        fetchStaffData,
        fetchGuestData,
        createRoom,
        updateRoom,
        deleteRoom,
        createTask,
        updateTaskStatus
    };
});