// Esta es una consulta compleja (Query) que cruza contextos (IAM y Property)
// Es normal que inyecte repositorios de diferentes dominios.

import { IUserRepository } from '../../iam/domain/repositories/i-user-repository.js';
import { IProfileRepository } from '../domain/repositories/i-profile-repository.js';
//TODO: Descomentar cuando el contexto Property esté implementado
//import { IPropertyRepository } from '../../property/domain/repositories/IPropertyRepository.js';

export class GetStaffDetailsQuery {

    constructor(userRepository, profileRepository, propertyRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.propertyRepository = propertyRepository; // Repositorio del otro Bounded Context
    }

    async execute() {
        console.log("GetStaffDetailsQuery: Executing...");
        try {
            const allUsers = await this.userRepository.getAllUsers();
            const allProfiles = await this.profileRepository.getAllProfiles();
            // Esta llamada cruza al contexto 'Property'
            const allTasks = await this.propertyRepository.getTasks();

            const staffUsers = allUsers.filter(user => user.isRole('staff'));

            const staffDetails = staffUsers.map(staff => {
                const profile = allProfiles.find(p => p.userId === staff.id);
                const assignedTasks = allTasks.filter(task => task.assignedTo === staff.id);

                // ... (Toda la lógica de cálculo de tu getStaffDetailsList original) ...
                const today = new Date().toISOString().split('T')[0];
                const roomsCleanedToday = assignedTasks.filter(task =>
                    task.status === 'Completada' &&
                    task.description.toLowerCase().includes('limpieza') &&
                    task.completedAt && task.completedAt.startsWith(today)
                ).length;

                const isOnShift = profile ? profile.isOnShift() : false;
                const shiftStatusKey = isOnShift ? 'onShift' : 'offShift';

                let displayStatus = profile?.currentStatus || 'unknown';
                if (!isOnShift) {
                    displayStatus = 'off_duty';
                }

                const currentTask = assignedTasks.find(task => task.status === 'Pendiente' || task.status === 'En proceso');

                return {
                    id: staff.id,
                    email: staff.email,
                    name: profile?.fullName || staff.email,
                    position: profile?.position || 'Staff',
                    shift: profile ? `${profile.shiftStart} - ${profile.shiftEnd}` : 'N/A',
                    shiftStatus: shiftStatusKey,
                    currentStatus: displayStatus,
                    currentTaskDescription: currentTask?.description || 'Ninguna',
                    roomsCleanedToday: roomsCleanedToday,
                };
            });

            console.log("GetStaffDetailsQuery: Processed:", staffDetails);
            return staffDetails;

        } catch (error) {
            console.error("Error in GetStaffDetailsQuery:", error);
            throw error;
        }
    }
}