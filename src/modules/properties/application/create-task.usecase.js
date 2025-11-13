// src/modules/properties/application/create-task.usecase.ts

import { IPropertyRepository } from '../domain/repositories/i-property-repository.js';
import { Task } from '../domain/model/Task.entity.js';

export class CreateTaskUseCase {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async execute(taskData) {
        // Creamos la entidad primero para aplicar reglas (como el 'createdAt')
        const taskEntity = new Task(taskData);

        // Convertimos a DTO para el repo (aunque el repo v1 acepta objeto simple)
        // const taskRequest = TaskAssembler.toRequest(taskEntity);
        // return await this.propertyRepository.addTask(taskRequest);

        // Simplificado para el repo v1:
        const taskWithDefaults = {
            ...taskData,
            status: taskData.status || 'Pendiente',
            createdAt: taskEntity.createdAt.toISOString()
        };
        return await this.propertyRepository.addTask(taskWithDefaults);
    }
}