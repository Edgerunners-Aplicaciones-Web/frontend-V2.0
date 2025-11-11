// src/modules/iam/infrastructure/user-assembler.js

import { User } from '../../domain/model/user.entity.js';
import { UserResponse } from '../response/user-response.js';

export const UserAssembler = {
    /**
     * Convierte una respuesta de API (DTO) a una Entidad User
     * @param {UserResponse} response - El objeto de la API
     * @returns {User}
     */
    toEntity(response) {
        if (!response) return null;
        return new User(
            response.id,
            response.email,
            response.password,
            response.role
        );
    },

    /**
     * Convierte una Entidad User a un objeto simple para un request de API
     * @param {User} entity - La entidad de dominio
     * @returns {object}
     */
    toRequest(entity) {
        return {
            email: entity.email,
            password: entity.password,
            role: entity.role
        };
    }
};