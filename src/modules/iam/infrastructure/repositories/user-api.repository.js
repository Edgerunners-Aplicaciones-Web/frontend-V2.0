import { IUserRepository } from "../../domain/repositories/i-user-repository.js";
import { userApi } from "../api/user-api.js";
import { UserAssembler } from "../assemblers/user.assembler.js";

export class UserApiRepository extends IUserRepository {
    async createUser(userEntity) {
        const userRequest = UserAssembler.toRequest(userEntity);
        const userResponse = await userApi.register(userRequest);
        return UserAssembler.toEntity(userResponse);
    }

    async findByEmail(email) {
        const userResponse = await userApi.getUserByEmail(email);
        return UserAssembler.toEntity(userResponse);
    }

    async getAllUsers() {
        const usersResponse = await userApi.fetchAllUsers();
        return usersResponse.map(UserAssembler.toEntity);
    }

    async deleteUser(userId) {
        await userApi.removeUser(userId);
    }

    async getUserById(userId) {
        const userResponse = await userApi.fetchUserById(userId);
        return UserAssembler.toEntity(userResponse);
    }

    async updateUser(userId, userData) {
        // userData aquí es un objeto simple, no una entidad completa
        const userResponse = await userApi.patchUser(userId, userData);
        return UserAssembler.toEntity(userResponse);
    }
}