// src/modules/iam/infrastructure/profiles-assembler.js

import { Profile } from '../../domain/model/profile.entity.js';

export const ProfileAssembler = {
    /**
     * Convierte una respuesta de API a una Entidad Profile
     * @param {object} response - El objeto de la API
     * @returns {Profile}
     */
    toEntity(response) {
        if (!response) return null;
        return new Profile(
            response.id,
            response.user_id,
            response.full_name,
            response.position,
            response.shift_start,
            response.shift_end,
            response.current_status
        );
    },

    /**
     * Convierte una Entidad Profile a un objeto simple para un request de API
     * @param {Profile} entity - La entidad de dominio
     * @returns {object}
     */
    toRequest(entity) {
        return {
            user_id: entity.userId,
            full_name: entity.fullName,
            position: entity.position,
            shift_start: entity.shiftStart,
            shift_end: entity.shiftEnd,
            current_status: entity.currentStatus
        };
    }
};