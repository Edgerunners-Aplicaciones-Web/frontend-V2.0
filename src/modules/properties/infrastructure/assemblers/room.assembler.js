// src/modules/properties/infrastructure/assemblers/room.assembler.js

import { Room } from '../../domain/model/Room.entity.js';

export const RoomAssembler = {
    toEntity(response) {
        if (!response) return null;
        return new Room({
            id: response.id,
            name: response.name,
            number: response.number,
            status: response.status,
            propertyId: response.propertyId, // Asume camelCase
            floor: response.floor,
            type: response.type,
            lastCleanedAt: response.lastCleanedAt,
            updatedAt: response.updatedAt,
            createdAt: response.createdAt,
            image_url: response.image_url,
            price: response.price,
            promotion: response.promotion,
            amenities: response.amenities
        });
    },

    toRequest(entity) {
        // Devuelve un objeto plano para la API
        return {
            id: entity.id,
            name: entity.name,
            number: entity.number,
            status: entity.status,
            propertyId: entity.propertyId,
            floor: entity.floor,
            type: entity.type,
            lastCleanedAt: entity.lastCleanedAt,
            updatedAt: entity.updatedAt,
            createdAt: entity.createdAt,
            image_url: entity.image_url,
            price: entity.price,
            promotion: entity.promotion,
            amenities: entity.amenities
        };
    }
};