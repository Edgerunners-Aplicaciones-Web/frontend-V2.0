import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// --- Importar Casos de Uso y Consultas ---
import { LoginUseCase } from '../login.usecase.js';
import { CreateUserWithProfileUseCase } from '../create-user-with-profile.usecase.js';
import { DeleteUserUseCase } from '../delete-user.usecase.js';
import { GetStaffDetailsQuery } from '../get-staff-details.query.js';

// --- Importar Servicios y Repositorios (Inyección de Dependencias) ---
import { IAMService } from '../../domain/services/IAM.service.js';
import { UserApiRepository } from '../../infrastructure/repositories/user-api.repository.js';
import { ProfileApiRepository } from '../../infrastructure/repositories/profile-api.repository.js';
//TODO: Importar repositorio de otro Bounded Context cuando esté implementado
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/property-api.repository.js'; // Repositorio del otro Bounded Context

// --- Inyección de Dependencias Manual (Singleton) ---
// (En un proyecto más grande, esto lo haría un contenedor de Inyección de Dependencias)
const userRepository = new UserApiRepository();
const profileRepository = new ProfileApiRepository();
const propertyRepository = new PropertyApiRepository(); // Dependencia externa

const iamService = new IAMService(userRepository, profileRepository);

const loginUseCase = new LoginUseCase(iamService);
const createUserWithProfileUseCase = new CreateUserWithProfileUseCase(iamService);
const deleteUserUseCase = new DeleteUserUseCase(iamService);
const getStaffDetailsQuery = new GetStaffDetailsQuery(userRepository, profileRepository, propertyRepository);
// --- Fin Inyección ---


export const useIAMStore = defineStore('iam', () => {
    // --- State ---
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('user_token') || null);
    const isAuthenticated = ref(!!localStorage.getItem('user_token'));
    const staffList = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const router = useRouter(); // Para redirección

    // --- Actions ---

    async function login(email, password, role) {
        loading.value = true;
        error.value = null;
        try {
            const loggedUser = await loginUseCase.execute(email, password, role);

            // Buscar perfil para obtener nombre
            let userName = loggedUser.email;
            try {
                const profile = await profileRepository.getProfileByUserId(loggedUser.id);
                if (profile && profile.fullName) {
                    userName = profile.fullName;
                }
            } catch (profileError) {
                console.warn('Login: No se pudo obtener el perfil.', profileError);
            }

            // Guardar estado
            const userData = {
                id: loggedUser.id,
                email: loggedUser.email,
                role: loggedUser.role,
                name: userName
            };

            localStorage.setItem('user_token', loggedUser.id);
            localStorage.setItem('user_role', loggedUser.role);
            localStorage.setItem('user', JSON.stringify(userData));

            user.value = userData;
            token.value = loggedUser.id;
            isAuthenticated.value = true;

            await router.push({ name: 'dashboard' });

        } catch (e) {
            error.value = e.message;
            isAuthenticated.value = false;
            throw e; // Re-lanzar para que la vista lo atrape
        } finally {
            loading.value = false;
        }
    }

    async function register(userData, profileData) {
        loading.value = true;
        error.value = null;
        try {
            // El caso de uso se encarga de crear User y Profile
            await createUserWithProfileUseCase.execute(userData, profileData);
            // Si tiene éxito, no logueamos, solo redireccionamos
        } catch (e) {
            error.value = e.message;
            throw e; // Re-lanzar para la vista
        } finally {
            loading.value = false;
        }
    }

    async function fetchStaffList() {
        loading.value = true;
        error.value = null;
        try {
            staffList.value = await getStaffDetailsQuery.execute();
        } catch (e) {
            error.value = e.message;
            staffList.value = [];
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function createStaffUser(userData, profileData) {
        loading.value = true;
        error.value = null;
        try {
            await createUserWithProfileUseCase.execute(userData, profileData);
            // Refrescar la lista después de crear
            await fetchStaffList();
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function deleteStaffUser(userId) {
        loading.value = true;
        error.value = null;
        try {
            await deleteUserUseCase.execute(userId);
            // Refrescar la lista
            await fetchStaffList();
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // (Faltaría la lógica de 'updateStaffUser' que seguiría este mismo patrón)

    return {
        user,
        token,
        isAuthenticated,
        staffList,
        loading,
        error,
        login,
        register,
        fetchStaffList,
        createStaffUser,
        deleteStaffUser
    };
});