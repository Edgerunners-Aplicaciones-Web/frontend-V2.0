import { IProfileRepository } from "../../domain/repositories/i-profile-repository.js";
import { profileApi } from "../api/profile-api.js";
import { ProfileAssembler } from "../assemblers/profile-assembler.js";

export class ProfileApiRepository extends IProfileRepository {
    async createProfile(profileEntity) {
        const profileRequest = ProfileAssembler.toRequest(profileEntity);
        const profileResponse = await profileApi.postProfile(profileRequest);
        return ProfileAssembler.toEntity(profileResponse);
    }

    async getProfileByUserId(userId) {
        const profileResponse = await profileApi.fetchProfileByUserId(userId);
        return ProfileAssembler.toEntity(profileResponse);
    }

    async getAllProfiles() {
        const profilesResponse = await profileApi.fetchAllProfiles();
        return profilesResponse.map(ProfileAssembler.toEntity);
    }

    async deleteProfileByUserId(userId) {
        await profileApi.removeProfileByUserId(userId);
    }

    async updateProfile(profileId, profileData) {
        // profileData es un objeto simple para el PATCH
        const profileResponse = await profileApi.patchProfile(profileId, profileData);
        return ProfileAssembler.toEntity(profileResponse);
    }
}