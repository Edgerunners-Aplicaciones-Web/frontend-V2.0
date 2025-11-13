// src/modules/properties/application/create-room.usecase.js

import { IPropertyRepository } from '../domain/repositories/i-property-repository.js';
import { Room } from '../domain/model/Room.entity.js';

export class CreateRoomUseCase {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    async execute(roomData) {
        console.log("CreateRoomUseCase: Executing...", roomData);
        return await this.propertyRepository.addRoom(roomData);
    }
}