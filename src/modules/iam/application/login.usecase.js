import { IAMService } from '../domain/services/IAM.service.js';

export class LoginUseCase {
    /**
     * @param {IAMService} iamService
     */
    constructor(iamService) {
        this.iamService = iamService;
    }

    async execute(email, password, role) {
        return await this.iamService.login(email, password, role);
    }
}