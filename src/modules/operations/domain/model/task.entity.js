/**
 * @class Task
 * @description Entidad de Dominio para una Tarea.
 * Esta es el "arma" que representa una tarea de operaciones (ej: limpieza).
 */
export class Task {
    constructor({
                    id = null,
                    propertyId,
                    roomId,
                    assignedTo, // ID del Staff (del BC 'IAM')
                    description,
                    status = 'Pendiente',
                    createdAt = new Date().toISOString(),
                    completedAt = null
                }) {
        if (!description || !assignedTo) {
            throw new Error("La descripción y el ID del staff asignado son requeridos.");
        }

        this.id = id;
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.assignedTo = assignedTo;
        this.description = description;
        this.status = status;
        // Aseguramos que las fechas sean objetos Date para lógica de negocio
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.completedAt = completedAt ? new Date(completedAt) : null;
    }

    /**
     * "Arma" de lógica de negocio: Marcar la tarea como completada.
     */
    complete() {
        if (this.status === 'Completada') return; // Ya está hecho
        this.status = 'Completada';
        this.completedAt = new Date();
    }

    /**
     * "Arma" de lógica de negocio: Revertir la tarea a pendiente.
     */
    revert() {
        if (this.status === 'Pendiente') return; // Ya está hecho
        this.status = 'Pendiente';
        this.completedAt = null;
    }

    /**
     * "Arma" de lógica de negocio: Iniciar la tarea.
     */
    start() {
        if (this.status === 'En proceso') return; // Ya está hecho
        this.status = 'En proceso';
        this.completedAt = null; // No puede estar completada si se está procesando
    }

    /**
     * Verifica si la tarea está terminada.
     * @returns {boolean}
     */
    isCompleted() {
        return this.status === 'Completada';
    }

    /**
     * Devuelve los datos de la entidad en un formato simple para la API.
     * @returns {object}
     */
    toRequestObject() {
        return {
            id: this.id,
            propertyId: this.propertyId,
            roomId: this.roomId,
            assignedTo: this.assignedTo,
            description: this.description,
            status: this.status,
            // Convertimos a ISO string para JSON
            createdAt: this.createdAt.toISOString(),
            completedAt: this.completedAt ? this.completedAt.toISOString() : null
        };
    }
}