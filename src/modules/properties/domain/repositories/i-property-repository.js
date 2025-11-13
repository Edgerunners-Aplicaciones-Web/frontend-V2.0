// src/modules/properties/domain/model/repositories/i-properties-repository.js

export class IPropertyRepository {
    // --- Métodos de Property ---
    getProperties() { throw new Error("Not implemented: getProperties"); }
    getAllProperties() { throw new Error("Not implemented: getAllProperties"); }
    getPropertyById(propertyId) { throw new Error("Not implemented: getPropertyById"); }
    createProperty(propertyData) { throw new Error("Not implemented: createProperty"); }
    updateProperty(propertyId, propertyData) { throw new Error("Not implemented: updateProperty"); }
    deleteProperty(propertyId) { throw new Error("Not implemented: deleteProperty"); }

    // --- Métodos de Room ---
    getRooms(propertyId = null) { throw new Error("Not implemented: getRooms"); }
    getRoomById(roomId) { throw new Error("Not implemented: getRoomById"); }
    addRoom(roomData) { throw new Error("Not implemented: addRoom"); }
    updateRoom(roomId, roomData) { throw new Error("Not implemented: updateRoom"); }
    deleteRoom(roomId) { throw new Error("Not implemented: deleteRoom"); }

    // --- Métodos de Task (Clave para IAM) ---
    getTasks(assignedTo = null) { throw new Error("Not implemented: getTasks"); }
    addTask(taskData) { throw new Error("Not implemented: addTask"); }
    updateTask(taskId, data) { throw new Error("Not implemented: updateTask"); }
    deleteTask(taskId) { throw new Error("Not implemented: deleteTask"); }
}