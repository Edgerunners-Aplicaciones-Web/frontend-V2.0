<template>
  <pv-button label="Guardar Cambios" icon="pi pi-check" @click="saveChanges" :loading="iamStore.loading" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIAMStore } from '../../application/store/iam.store.js';
import { UserApiRepository } from '../../infrastructure/repositories/user-api.repository.js';
import { ProfileApiRepository } from '../../../profile/infrastructure/repositories/profile-api.repository.js';


// --- Inicializa hooks ---
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const iamStore = useIAMStore();

// --- Estado del Componente (Local para el formulario) ---
const userId = ref(route.params.userId);
const editableUserData = ref({});
const editableProfileData = ref({});
const profileId = ref(null); // Necesitamos el ID del perfil para el PATCH
const loading = ref(true);
// const saving = ref(false); // <-- Usamos iamStore.loading

// --- Repositorios (solo para la carga inicial) ---
// Idealmente, esto se movería a una acción del store: `iamStore.fetchUserForEdit(userId)`
const userRepository = new UserApiRepository();
const profileRepository = new ProfileApiRepository();

// --- Opciones para Selects (Igual) ---
const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' },
]);
const translatedRoles = computed(() => baseRoles.value.map(role => ({ label: t(role.key), value: role.value })));
const statusOptions = ref([
  { label: t('staffStatus.available'), value: 'available'},
  { label: t('staffStatus.busy'), value: 'busy'},
  { label: t('staffStatus.on_break'), value: 'on_break'},
  { label: t('staffStatus.off_duty'), value: 'off_duty'}
]);

onMounted(async () => {
  if (!userId.value) { /* ... */ return; }
  loading.value = true;
  try {
    const user = await userRepository.getUserById(userId.value);
    editableUserData.value = { email: user.email, role: user.role };

    const profile = await profileRepository.getProfileByUserId(userId.value);
    if (profile) {
      editableProfileData.value = { ...profile };
      profileId.value = profile.id; // Guardamos el ID del perfil
    } else {
      editableProfileData.value = { user_id: parseInt(userId.value) };
    }
  } catch (error) {
    console.error("Error loading user/profile data:", error);
  } finally {
    loading.value = false;
  }
});

async function saveChanges() {
  // Aquí necesitarías una acción en tu store: `iamStore.updateUserAndProfile`
  console.log("Guardando... (Esto requeriría una acción 'update' en el store)");

  // Lógica simulada de cómo llamarías al store:
  /*
  try {
    await iamStore.updateUserAndProfile(
      userId.value,
      profileId.value,
      editableUserData.value,
      editableProfileData.value
    );
    alert("¡Usuario actualizado con éxito!");
    router.push({ name: 'admin-manage-users' });
  } catch (error) {
    alert(`Error al guardar: ${error.message}`);
  }
  */

  alert("Lógica de guardado (via Store) iría aquí.");
  router.push({ name: 'admin-manage-users' });
}

function cancelEdit() {
  router.push({ name: 'admin-manage-users' });
}
</script>

<style scoped>
.edit-user-container {
  max-width: 800px;
  margin: 2rem auto;
}
.p-grid { display: grid; }
.p-nogutter { gap: 0; }
.p-col-6 { grid-column: span 6 / span 6; }
.pr-1 { padding-right: 0.25rem; }
.pl-1 { padding-left: 0.25rem; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto;}
.max-w-lg { max-width: 32rem; /* Ajusta según necesites */ }
.text-red-500 { color: #ef4444; }
</style>