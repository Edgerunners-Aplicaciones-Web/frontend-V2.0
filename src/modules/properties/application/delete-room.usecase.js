// src/modules/properties/application/delete-room.usecase.js

import { IPropertyRepository } from '../domain/repositories/i-property-repository.js';

export class DeleteRoomUseCase {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async execute(roomId) {
        console.log(`DeleteRoomUseCase: Executing for ${roomId}`);
        return await this.propertyRepository.deleteRoom(roomId);
    }
}