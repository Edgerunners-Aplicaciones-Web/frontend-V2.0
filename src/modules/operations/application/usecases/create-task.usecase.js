// src/modules/operations/application/usecases/create-task.usecase.ts

import { IOperationsRepository } from '../../domain/repositories/i-operations-repository.js';
import { Task } from '../../domain/model/Task.entity.js';
import { TaskAssembler } from '../../infrastructure/assemblers/Task.assembler.js';

export class CreateTaskUseCase {
    constructor(operationsRepository) {
        this.operationsRepository = operationsRepository;
    }

    async execute(taskData) {
        const taskEntity = new Task(taskData);
        const taskRequest = TaskAssembler.toRequest(taskEntity);
        return await this.operationsRepository.createTask(taskRequest);
    }
}