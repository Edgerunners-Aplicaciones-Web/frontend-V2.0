// src/modules/property/infrastructure/repositories/property-api.repository.js

import { IPropertyRepository } from "../../domain/repositories/i-property-repository.js";
import { propertyApi } from "../api/property-api.js";
import { PropertyAssembler } from "../assemblers/property.assembler.js";
import { RoomAssembler } from "../assemblers/room.assembler.js";
import { TaskAssembler } from "../assemblers/task.assembler.js";

export class PropertyApiRepository extends IPropertyRepository {

    // --- Métodos de Property ---
    async getProperties() {
        const response = await propertyApi.fetchProperties();
        return response.map(PropertyAssembler.toEntity);
    }
    async getAllProperties() {
        return this.getProperties(); // Reutiliza
    }
    async getPropertyById(propertyId) {
        const response = await propertyApi.fetchPropertyById(propertyId);
        return PropertyAssembler.toEntity(response);
    }
    async createProperty(propertyData) {
        // Asume que propertyData es un objeto simple, no una entidad
        const response = await propertyApi.postProperty(propertyData);
        return PropertyAssembler.toEntity(response);
    }
    async updateProperty(propertyId, propertyData) {
        const response = await propertyApi.patchProperty(propertyId, propertyData);
        return PropertyAssembler.toEntity(response);
    }
    async deleteProperty(propertyId) {
        await propertyApi.removeProperty(propertyId);
    }

    // --- Métodos de Room ---
    async getRooms(propertyId = null) {
        const response = await propertyApi.fetchRooms(propertyId);
        return response.map(RoomAssembler.toEntity);
    }
    async getRoomById(roomId) {
        const response = await propertyApi.fetchRoomById(roomId);
        return RoomAssembler.toEntity(response);
    }
    async addRoom(roomData) {
        // Asume que roomData es un objeto simple
        const response = await propertyApi.postRoom(roomData);
        return RoomAssembler.toEntity(response);
    }
    async updateRoom(roomId, roomData) {
        const response = await propertyApi.patchRoom(roomId, roomData);
        return RoomAssembler.toEntity(response);
    }
    async deleteRoom(roomId) {
        await propertyApi.removeRoom(roomId);
    }

    // --- Métodos de Task (Clave para IAM) ---
    async getTasks(assignedTo = null) {
        const response = await propertyApi.fetchTasks(assignedTo);
        return response.map(TaskAssembler.toEntity);
    }
    async addTask(taskData) {
        // Asume taskData es un objeto simple
        const response = await propertyApi.postTask(taskData);
        return TaskAssembler.toEntity(response);
    }
    async updateTask(taskId, data) {
        const response = await propertyApi.patchTask(taskId, data);
        return TaskAssembler.toEntity(response);
    }
    async deleteTask(taskId) {
        await propertyApi.removeTask(taskId);
    }
}