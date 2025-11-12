// ¡"Traductor" movido de 'Property' a 'Operations'!
import { Task } from '../../domain/model/Task.entity.js';

/**
 * @class TaskAssembler
 * @description Traduce entre los datos crudos de la API (DTO) y la Entidad Task.
 * Es el "intérprete" del equipo.
 */
export const TaskAssembler = {
    /**
     * Convierte una respuesta de API (DTO) a una Entidad Task
     * @param {object} response - El objeto JSON de la API
     * @returns {Task}
     */
    toEntity(response) {
        if (!response) return null;
        return new Task({
            id: response.id,
            propertyId: response.propertyId,
            roomId: response.roomId,
            assignedTo: response.assignedTo,
            description: response.description,
            status: response.status,
            createdAt: response.createdAt,
            completedAt: response.completedAt
        });
    },

    /**
     * Convierte una Entidad Task a un objeto simple (DTO) para un request de API
     * @param {Task} entity - La entidad de dominio
     * @returns {object}
     */
    toRequest(entity) {
        // Devuelve solo los datos que la API necesita
        return {
            id: entity.id, // Puede ser null si es nuevo
            propertyId: entity.propertyId,
            roomId: entity.roomId,
            assignedTo: entity.assignedTo,
            description: entity.description,
            status: entity.status,
            createdAt: entity.createdAt,
            completedAt: entity.completedAt
        };
    }
};