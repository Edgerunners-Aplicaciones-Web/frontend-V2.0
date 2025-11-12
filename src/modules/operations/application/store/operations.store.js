import { defineStore } from 'pinia';
import { ref } from 'vue';

// --- Importar Casos de Uso y Consultas ---
import { CreateTaskUseCase } from '../usecases/create-task.usecase.js';
import { UpdateTaskStatusUseCase } from '../usecases/update-task-status.usecase.js';

// --- Importar Repositorios (Inyección de Dependencias) ---
import { OperationsApiRepository } from '../../infrastructure/repositories/operations-api.repository.js';


// --- Inyección de Dependencias Manual ---
const operationsRepository = new OperationsApiRepository();

const createTaskUseCase = new CreateTaskUseCase(operationsRepository);
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(operationsRepository);


export const useOperationsStore = defineStore('operations', () => {
    // --- State ---
    const tasks = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    /**
     * Táctica: Cargar todas las tareas de un staff
     */
    async function fetchTasks(staffId) {
        if (!staffId) {
            console.warn("fetchTasks: No staffId provided");
            tasks.value = [];
            return;
        }
        loading.value = true;
        error.value = null;
        try {
            tasks.value = await operationsRepository.getTasks(staffId);
        } catch (e) {
            error.value = e.message;
            tasks.value = [];
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Táctica: Crear una nueva tarea y recargar la lista
     */
    async function createTask(taskData) {
        loading.value = true;
        error.value = null;
        try {
            await createTaskUseCase.execute(taskData);
            await fetchTasks(taskData.assignedTo); // Recarga la lista del staff
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Táctica: Actualizar el estado de una tarea y recargar
     */
    async function updateTaskStatus(taskId, newStatus, staffId) {
        loading.value = true;
        error.value = null;
        try {
            await updateTaskStatusUseCase.execute(taskId, newStatus);
            await fetchTasks(staffId); // Recarga
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * ¡NUEVA TÁCTICA!
     * Táctica: Actualizar los detalles de una tarea y recargar
     */
    async function updateTask(taskId, taskData, staffId) {
        loading.value = true;
        error.value = null;
        try {
            // (Idealmente esto usaría un 'updateTaskUseCase')
            await operationsRepository.updateTask(taskId, taskData);
            await fetchTasks(staffId); // Recarga
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * ¡NUEVA TÁCTICA!
     * Táctica: Borrar una tarea y recargar
     */
    async function deleteTask(taskId, staffId) {
        loading.value = true;
        error.value = null;
        try {
            // (Idealmente esto usaría un 'deleteTaskUseCase')
            await operationsRepository.deleteTask(taskId);
            await fetchTasks(staffId); // Recarga
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }


    return {
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask
    };
});