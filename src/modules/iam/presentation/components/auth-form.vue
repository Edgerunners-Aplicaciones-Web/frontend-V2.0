<template>
  <!-- ¡ESTE ES EL TEMPLATE QUE FALTABA! -->
  <div class="p-card p-4 max-w-md mx-auto">
    <h2 class="text-center mb-4">{{ isLogin ? t('auth.signInTitle') : t('auth.registerTitle') }}</h2>

    <div class="p-fluid">
      <div class="field">
        <label>{{ t('auth.emailLabel') }}</label>
        <pv-input-text v-model="form.email" :placeholder="t('auth.emailPlaceholder')" />
      </div>

      <div class="field" v-if="!isLogin">
        <label>{{ t('auth.nameLabel') }}</label>
        <pv-input-text v-model="form.name" :placeholder="t('auth.namePlaceholder')" />
      </div>

      <div class="field">
        <label>{{ t('auth.passwordLabel') }}</label>
        <pv-password v-model="form.password" toggleMask :feedback="false" :placeholder="t('auth.passwordPlaceholder')" />
      </div>

      <div class="field">
        <label>{{ t('auth.roleLabel') }}</label>
        <pv-select
            v-model="form.role"
            :options="translatedRoles"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('auth.rolePlaceholder')"
            class="w-full"
        />
      </div>

      <pv-button :label="isLogin ? t('auth.signInButton') : t('auth.registerButton')" class="mt-3 w-full" @click="submitForm" :loading="iamStore.loading" />
    </div>

    <p class="text-center mt-3">
      <router-link :to="isLogin ? '/register' : '/login'" class="text-blue-600 hover:text-blue-800">
        {{ isLogin ? t('auth.registerLink') : t('auth.signInLink') }}
      </router-link>
    </p>
  </div>
</template>

<script setup>
// Importar componentes de PrimeVue
import PvButton from 'primevue/button';
import PvInputText from 'primevue/inputtext';
import PvPassword from 'primevue/password';
import PvSelect from 'primevue/select';

// Importar hooks de Vue y helpers
import { ref, defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// --- Importar el Store ---
// (Asegúrate que la ruta a tu store sea correcta)
import { useIAMStore } from '../../application/store/iam.store.js';

// --- Inicializar Store e i18n ---
const { t } = useI18n();
const iamStore = useIAMStore(); // <-- ¡Aquí está el Store!
const router = useRouter(); // Para la redirección de registro

// --- Props ---
const props = defineProps({
  startInLoginMode: {
    type: Boolean,
    default: true
  }
});

// --- Estado del Componente ---
const isLogin = ref(props.startInLoginMode);
const form = ref({ email: '', name: '', password: '', role: '' });

// --- Roles (¡ESTO TAMBIÉN FALTABA!) ---
const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' }
]);

// --- Propiedad Computada para Roles Traducidos ---
const translatedRoles = computed(() => {
  return baseRoles.value.map(role => ({
    label: t(role.key),
    value: role.value
  }));
});

// --- Métodos (AHORA USAN EL STORE) ---
async function submitForm() {
  // Validación
  if (!form.value.email || !form.value.password || !form.value.role || (!isLogin.value && !form.value.name)) {
    alert(t('auth.validationError'));
    return;
  }

  try {
    if (isLogin.value) {
      // --- Lógica de Login (usa el Store) ---
      console.log(`Llamando a iamStore.login para: ${form.value.email}`);
      await iamStore.login(form.value.email, form.value.password, form.value.role);
      // La redirección ocurre DENTRO del store

    } else {
      // --- Lógica de Registro (usa el Store) ---
      console.log(`Llamando a iamStore.register para: ${form.value.email}`);
      const userData = {
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
      };
      const profileData = {
        full_name: form.value.name
      };

      await iamStore.register(userData, profileData);

      alert(t('auth.registerSuccess'));
      await router.push('/login'); // Redirigir a login tras registro
    }
  } catch (error) {
    console.error('Auth Error (Vista):', error.message || error);
    alert(`${t('auth.authFailedPrefix')}: ${error.message || t('auth.authFailedGeneric')}`);
  }

}
</script>

<style scoped>
/* Estilos del componente */
.p-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background-color: #ffffff; /* Asegura fondo blanco para el form */
  border-radius: 8px;
}
:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-select),
:deep(.p-button) {
  width: 100%;
}
.text-blue-600 { color: #2563eb; }
.hover\:text-blue-800:hover { color: #1e40af; }
</style>