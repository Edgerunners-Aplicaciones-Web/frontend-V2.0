// src/modules/properties/domain/model/task.entity.js

export class Task {
    constructor({
                    id,
                    description,
                    status,
                    assignedTo, // Este es el "pase" al Bounded Context 'IAM'
                    roomId,     // Este es el "pase" a la entidad 'Room'
                    createdAt,
                    completedAt
                }) {
        this.id = id;
        this.description = description;
        this.status = status || 'Pendiente'; // 'Pendiente', 'En proceso', 'Completada'
        this.assignedTo = assignedTo; // staffId
        this.roomId = roomId;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.completedAt = completedAt ? new Date(completedAt) : null;
    }

    // "Armas" de lógica de negocio
    isCompleted() {
        return this.status === 'Completada';
    }

    complete() {
        this.status = 'Completada';
        this.completedAt = new Date();
    }

    revert() {
        this.status = 'Pendiente';
        this.completedAt = null;
    }
}