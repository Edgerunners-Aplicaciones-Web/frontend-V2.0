// src/modules/property/application/update-room.usecase.js

import { IPropertyRepository } from '../domain/model/repositories/i-property-repository.js';

export class UpdateRoomUseCase {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async execute(roomId, roomData) {
        console.log(`UpdateRoomUseCase: Executing for ${roomId}`, roomData);
        return await this.propertyRepository.updateRoom(roomId, roomData);
    }
}