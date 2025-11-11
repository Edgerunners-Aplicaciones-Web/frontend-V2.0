// src/modules/property/infrastructure/assemblers/task.assembler.js

import { Task } from '../../domain/model/Task.entity.js';

export const TaskAssembler = {
    toEntity(response) {
        if (!response) return null;
        return new Task({
            id: response.id,
            description: response.description,
            status: response.status,
            assignedTo: response.assignedTo, // asume camelCase
            roomId: response.roomId,
            createdAt: response.createdAt,
            completedAt: response.completedAt
        });
    },

    toRequest(entity) {
        return {
            id: entity.id,
            description: entity.description,
            status: entity.status,
            assignedTo: entity.assignedTo,
            roomId: entity.roomId,
            createdAt: entity.createdAt.toISOString(),
            completedAt: entity.completedAt ? entity.completedAt.toISOString() : null
        };
    }
};