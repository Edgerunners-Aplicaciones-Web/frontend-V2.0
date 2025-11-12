<template>
  <div class="p-4 add-user-container">
    <h2 class="text-2xl font-bold mb-4">
      <i class="pi pi-user-plus mr-2"></i> {{ t('adminAddUser.title') }}
    </h2>

    <div class="p-fluid max-w-lg mx-auto">
      <div class="field">
        <label for="name">{{ t('adminAddUser.nameLabel') }}</label>
        <pv-input-text id="name" v-model="profileData.full_name" :placeholder="t('adminAddUser.namePlaceholder')" />
      </div>

      <div class="field">
        <label for="email">{{ t('adminAddUser.emailLabel') }}</label>
        <pv-input-text
            id="email"
            v-model="userData.email"
            placeholder="user@example.com"
        />
      </div>

      <div class="field">
        <label for="password">{{ t('adminAddUser.passwordLabel') }}</label>
        <pv-input-text id="password" type="password" v-model="userData.password" :placeholder="t('adminAddUser.passwordPlaceholder')" />
      </div>

      <div class="field">
        <label for="role">{{ t('adminAddUser.roleLabel') }}</label>
        <pv-select id="role" v-model="userData.role" :options="translatedRoles" optionLabel="label" optionValue="value" :placeholder="t('adminAddUser.rolePlaceholder')" />
      </div>

      <!-- Campos específicos de Staff -->
      <div v-if="userData.role === 'staff'">
        <div class="field">
          <label for="position">{{ t('adminAddUser.positionLabel') }}</label>
          <pv-input-text id="position" v-model="profileData.position" :placeholder="t('adminAddUser.positionPlaceholder')" />
        </div>

        <div class="field p-grid p-nogutter">
          <div class="p-col-6 pr-1">
            <label for="shift_start">{{ t('adminAddUser.shiftStartLabel') }}</label>
            <pv-input-text id="shift_start" v-model="profileData.shift_start" placeholder="08:00" />
          </div>
          <div class="p-col-6 pl-1">
            <label for="shift_end">{{ t('adminAddUser.shiftEndLabel') }}</label>
            <pv-input-text id="shift_end" v-model="profileData.shift_end" placeholder="16:00"/>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-secondary" @click="cancelAdd" />
        <pv-button :label="t('adminAddUser.createButton')" icon="pi pi-check" @click="createUser" :loading="iamStore.loading" />
      </div>
    </div>
    <pv-toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from "primevue/usetoast";

// Importa los "jugadores" de PrimeVue que SÍ usas en el template
import PvInputText from 'primevue/inputtext';
import PvSelect from 'primevue/select';
import PvButton from 'primevue/button';
import PvToast from 'primevue/toast';

// Importa el "cerebro" (Store)
import { useIAMStore } from '../../application/store/iam.store.js'; // Tu import (asume 'iam.store.js' en minúscula)

// Inicializa las "armas"
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const iamStore = useIAMStore();

// "Estado" del jugador (formulario)
const userData = ref({ email: '', password: '', role: 'staff' });
const profileData = ref({ full_name: '', position: '', shift_start: '', shift_end: '' });

// "Táctica" para los roles
const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' },
]);
const translatedRoles = computed(() => baseRoles.value.map(role => ({ label: t(role.key), value: role.value })));

// "Fórmula de Gol" (Crear Usuario)
async function createUser() {
  if (!userData.value.email || !userData.value.password || !userData.value.role || !profileData.value.full_name) {
    toast.add({ severity: 'warn', summary: t('errors.validationError'), detail: t('adminAddUser.validationDetail'), life: 3000 });
    return;
  }

  console.log("Llamando a iamStore.createStaffUser...");
  try {
    // ¡Pasa el balón al "cerebro" (Store)!
    await iamStore.createStaffUser(userData.value, profileData.value);

    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminAddUser.createSuccess', { name: userData.value.email }), life: 3000 }); // Corregido a 'adminAddUser.createSuccess'
    router.push({ name: 'admin-manage-users' }); // Vuelve a la lista

  } catch (error) {
    console.error("Error creating user (View):", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 4000 });
  }
}

// "Táctica de Retirada"
function cancelAdd() {
  router.push({ name: 'admin-manage-users' });
}
</script>

<style scoped>
.add-user-container {
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
.max-w-lg { max-width: 32rem; }
.field {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
</style>