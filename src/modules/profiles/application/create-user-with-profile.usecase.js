import { IAMService } from '../../iam/domain/services/iam.service.js';
import { User } from '../../iam/domain/model/user.entity.js';
import { Profile } from '../domain/model/profile.entity.js';

export class CreateUserWithProfileUseCase {
    /**
     * @param {IAMService} iamService
     */
    constructor(iamService) {
        this.iamService = iamService;
    }

    /**
     * @param {object} userData - { email, password, role }
     * @param {object} profileData - { fullName, position, shiftStart, shiftEnd }
     */
    async execute(userData, profileData = {}) {
        // 1. Crear entidades de dominio desde los datos crudos
        const userEntity = new User(
            null, // El ID se genera en la persistencia
            userData.email,
            userData.password,
            userData.role
        );

        const profileEntity = new Profile(
            null, null, // IDs
            profileData.full_name,
            profileData.position,
            profileData.shift_start,
            profileData.shift_end,
            profileData.current_status || (userData.role === 'staff' ? 'available' : null)
        );

        // 2. Ejecutar el servicio de dominio
        return await this.iamService.registerUserAndProfile(userEntity, profileEntity);
    }
}