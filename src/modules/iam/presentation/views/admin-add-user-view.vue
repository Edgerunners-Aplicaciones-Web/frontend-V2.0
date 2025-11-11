<template>
  <pv-button :label="t('adminAddUser.createButton')" icon="pi pi-check" @click="createUser" :loading="iamStore.loading" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from "primevue/usetoast";

import PvInputText from 'primevue/inputtext';
import PvSelect from 'primevue/select';
import PvButton from 'primevue/button';
import PvToast from 'primevue/toast';

import { useIAMStore } from '../../application/store/iam.store.js';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const iamStore = useIAMStore();

const userData = ref({ email: '', password: '', role: 'staff' });
const profileData = ref({ full_name: '', position: '', shift_start: '', shift_end: '' });

const baseRoles = ref([
  { key: 'auth.roleAdmin', value: 'admin' },
  { key: 'auth.roleStaff', value: 'staff' },
  { key: 'auth.roleGuest', value: 'guest' },
]);

const translatedRoles = computed(() => baseRoles.value.map(role => ({ label: t(role.key), value: role.value })));

async function createUser() {
  if (!userData.value.email || !userData.value.password || !userData.value.role || !profileData.value.full_name) {
    toast.add({ severity: 'warn', summary: t('errors.validationError'), detail: t('adminAddUser.validationDetail'), life: 3000 });
    return;
  }

  console.log("Llamando a iamStore.createStaffUser...");
  try {
    await iamStore.createStaffUser(userData.value, profileData.value);

    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminAddDser.createSuccess', { name: userData.value.email }), life: 3000 });
    router.push({ name: 'admin-manage-users' }); // Vuelve a la lista

  } catch (error) {
    console.error("Error creating user (View):", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 4000 });
  }
}

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
</style>