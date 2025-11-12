// src/modules/operations/application/usecases/update-task-status.usecase.js

import { IOperationsRepository } from '../../domain/repositories/i-operations-repository.js';
import { Task } from '../../domain/model/Task.entity.js';

export class UpdateTaskStatusUseCase {
    constructor(operationsRepository) {
        this.operationsRepository = operationsRepository;
    }

    async execute(taskId, status) {
        console.log(`UpdateTaskStatusUseCase: Task ${taskId} -> ${status}`);

        // Usamos la lógica de la entidad para crear el objeto de parche
        const taskEntity = new Task({}); // Entidad temporal
        let updateData = { status };

        if (status === 'Completada') {
            taskEntity.complete();
            updateData.status = taskEntity.status;
            updateData.completedAt = taskEntity.completedAt.toISOString();
        } else {
            taskEntity.revert(); // Asume que 'Pendiente' u otros revierten
            updateData.status = taskEntity.status;
            updateData.completedAt = taskEntity.completedAt; // null
        }

        return await this.operationsRepository.updateTask(taskId, updateData);
    }
}