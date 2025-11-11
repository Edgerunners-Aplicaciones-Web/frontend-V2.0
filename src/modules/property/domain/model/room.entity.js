// src/modules/property/domain/model/room.entity.js

export class Room {
    constructor({
                    id,
                    name,
                    number,
                    status,
                    propertyId,
                    floor,
                    type,
                    lastCleanedAt,
                    updatedAt,
                    createdAt,
                    image_url,
                    price,
                    promotion,
                    amenities
                }) {
        this.id = id;
        this.name = name;
        this.number = number;
        this.status = status || 'available';
        this.propertyId = propertyId;
        this.floor = floor;
        this.type = type;
        this.lastCleanedAt = lastCleanedAt ? new Date(lastCleanedAt) : null;
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.image_url = image_url;
        this.price = price;
        this.promotion = promotion;
        this.amenities = amenities || { has_tv: false, has_room_service: false, has_wifi: false };
    }

    // "Armas" de lógica de negocio
    isAvailable() { return this.status === 'available'; }
    isCleaning() { return this.status === 'cleaning'; }
    isOccupied() { return this.status === 'occupied'; }
    isMaintenance() { return this.status === 'maintenance'; }
}