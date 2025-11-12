/**
 * @interface IOperationsRepository
 * @description Interfaz (el "contrato") para la persistencia de 'Task'.
 */
export class IOperationsRepository {
    getTasks(assignedTo = null) { throw new Error("Not implemented: getTasks"); }
    getTaskById(taskId) { throw new Error("Not implemented: getTaskById"); }
    createTask(taskEntity) { throw new Error("Not implemented: createTask"); }
    updateTask(taskId, taskData) { throw new Error("Not implemented: updateTask"); }
    deleteTask(taskId) { throw new Error("Not implemented: deleteTask"); }
}