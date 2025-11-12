// src/modules/operations/infrastructure/repositories/operations-api.repository.js

import { IOperationsRepository } from "../../domain/repositories/i-operations-repository.js";
import { operationsApi } from "../api/operations-api.js";
import { TaskAssembler } from "../assemblers/Task.assembler.js";

export class OperationsApiRepository extends IOperationsRepository {
    async getTasks(assignedTo = null) {
        const response = await operationsApi.fetchTasks(assignedTo);
        return response.map(TaskAssembler.toEntity);
    }
    async getTaskById(taskId) {
        const response = await operationsApi.fetchTaskById(taskId);
        return TaskAssembler.toEntity(response);
    }
    async createTask(taskEntity) {
        const requestData = TaskAssembler.toRequest(taskEntity);
        const response = await operationsApi.postTask(requestData);
        return TaskAssembler.toEntity(response);
    }
    async updateTask(taskId, data) {
        const response = await operationsApi.patchTask(taskId, data);
        return TaskAssembler.toEntity(response);
    }
    async deleteTask(taskId) {
        await operationsApi.removeTask(taskId);
    }
}