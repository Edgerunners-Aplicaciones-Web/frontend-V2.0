// src/iam/domain/services/iam.service.js

export class IAMService {
    constructor(userRepository, profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Lógica de negocio para el login.
     */
    async login(email, password, role) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.password !== password || user.role !== role) {
            throw new Error('Credenciales inválidas o rol incorrecto');
        }
        return user;
    }

    /**
     * Lógica de negocio para crear un usuario y su perfil en una sola transacción.
     */
    async registerUserAndProfile(userEntity, profileEntity) {
        // 1. Validar que el email no exista
        const existingUser = await this.userRepository.findByEmail(userEntity.email);
        if (existingUser) {
            throw new Error(`El email ${userEntity.email} ya está registrado.`);
        }

        // 2. Crear el usuario
        const newUser = await this.userRepository.createUser(userEntity);
        if (!newUser || !newUser.id) {
            throw new Error("Falló la creación del usuario.");
        }

        // 3. Si hay datos de perfil, crearlo y asociarlo
        if (profileEntity.fullName) {
            try {
                profileEntity.userId = newUser.id; // Asocia el ID
                await this.profileRepository.createProfile(profileEntity);
            } catch (profileError) {
                // Rollback: Si falla el perfil, borramos el usuario creado
                await this.userRepository.deleteUser(newUser.id);
                throw new Error(`Falló la creación del perfil. Se revirtió el usuario: ${profileError.message}`);
            }
        }
        return newUser;
    }

    /**
     * Lógica de negocio para borrar un usuario y su perfil asociado.
     */
    async deleteUserAndProfile(userId) {
        // Borra primero el perfil, luego el usuario.
        await this.profileRepository.deleteProfileByUserId(userId);
        await this.userRepository.deleteUser(userId);
        return true;
    }
}