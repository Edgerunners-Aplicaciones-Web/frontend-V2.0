// src/modules/properties/infrastructure/assemblers/properties.assembler.js

import { Property } from '../../domain/model/Property.entity.js';

export const PropertyAssembler = {
    toEntity(response) {
        if (!response) return null;
        return new Property({
            id: response.id,
            hostId: response.hostId, // Asume que la API usa camelCase
            name: response.name,
            location: response.location,
            image_url: response.image_url,
            description: response.description,
            base_price: response.base_price,
            type: response.type,
            amenities: response.amenities || []
        });
    },

    toRequest(entity) {
        return {
            id: entity.id,
            hostId: entity.hostId,
            name: entity.name,
            location: entity.location,
            image_url: entity.image_url,
            description: entity.description,
            base_price: entity.base_price,
            type: entity.type,
            amenities: entity.amenities
        };
    }
};