import { IAMService } from '../domain/services/IAM.service.js';

export class DeleteUserUseCase {
    /**
     * @param {IAMService} iamService
     */
    constructor(iamService) {
        this.iamService = iamService;
    }

    async execute(userId) {
        if (!userId) throw new Error("User ID es requerido.");
        return await this.iamService.deleteUserAndProfile(userId);
    }
}