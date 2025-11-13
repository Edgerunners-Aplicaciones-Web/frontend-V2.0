// src/modules/properties/application/update-task-status.usecase.js

import { IPropertyRepository } from '../domain/repositories/i-property-repository.js';

export class UpdateTaskStatusUseCase {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async execute(taskId, status) {
        console.log(`UpdateTaskStatusUseCase: Task ${taskId} -> ${status}`);
        let updateData = { status };

        if (status === 'Completada') {
            updateData.completedAt = new Date().toISOString();
        } else if (status === 'Pendiente') {
            updateData.completedAt = null; // Quitar fecha de completado
        }

        return await this.propertyRepository.updateTask(taskId, updateData);
    }
}