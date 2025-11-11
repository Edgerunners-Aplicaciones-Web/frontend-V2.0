<template>
  <div class="p-4 manage-rooms-container">
    <pv-toast position="bottom-right" />
    <pv-confirm-dialog></pv-confirm-dialog>

    <!-- ... (Toolbar: openNew, loadRooms, layout) ... -->
    <pv-toolbar class="mb-4">
      <template #start>
        <pv-button :label="t('common.add')" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
      </template>
      <template #end>
        <!-- Ahora usa el 'loading' del store -->
        <pv-button icon="pi pi-refresh" class="p-button-text" @click="loadRooms" :loading="store.loading" v-tooltip.top="t('common.refresh')"/>
        <pv-select-button v-model="layout" :options="layoutOptions" optionLabel="icon" optionValue="value" dataKey="value" >
          <template #option="slotProps">
            <i :class="slotProps.option.icon"></i>
          </template>
        </pv-select-button>
      </template>
    </pv-toolbar>

    <!-- ... (Filtros: filterSearchTerm, filterProperty, filterStatus) ... -->
    <div class="dataview-header-filters ...">
      <!-- ... -->
      <pv-select
          id="filter-property"
          v-model="filterProperty"
          :options="store.properties"
      optionLabel="name"
      optionValue="id"
      ...
      />
      <!-- ... -->
    </div>

    <!-- Conteo usa 'filteredRooms' (computada local) -->
    <div class="p-dataview-header-info ...">
      {{ t('adminManageRooms.totalRooms', { count: filteredRooms.length }) }}
    </div>

    <!-- Loading usa 'store.loading' -->
    <div v-if="store.loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>{{ t('adminManageRooms.loadingMessage') }}</p>
    </div>

    <!-- Empty usa 'filteredRooms' -->
    <div v-else-if="!filteredRooms.length" class="text-center p-4">
      {{ t('adminManageRooms.emptyMessage') }}
    </div>

    <!-- DataView usa 'paginatedRooms' (computada local) -->
    <div v-else :class="['dataview-content', layout === 'grid' ? 'grid' : 'list']">
      <div v-for="room in paginatedRooms" :key="room.id">
        <!-- ... (Contenido de 'list' y 'grid' idéntico a tu v1) ... -->
      </div>
    </div>

    <!-- Paginator usa 'filteredRooms' -->
    <pv-paginator
        v-if="!store.loading && filteredRooms.length > rowsPerPage"
        :rows="rowsPerPage"
        :totalRecords="filteredRooms.length"
        :first="first"
        @page="onPage"
        ...
    ></pv-paginator>

    <!-- Diálogo (Formulario) -->
    <pv-dialog v-model:visible="displayDialog" ...>
      <!-- ... (Contenido idéntico, pero el <pv-select> de Hotel usa store.properties) ... -->
      <div class="field">
        <label for="property">Hotel</label>
        <pv-select
            id="property"
            v-model="selectedRoom.propertyId"
            :options="store.properties" <!-- USA store.properties -->
        optionLabel="name"
        optionValue="id"
        ...
        />
        <!-- ... -->
      </div>
      <!-- ... (Resto del formulario idéntico) ... -->
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" text @click="hideDialog"/>
        <!-- 'saving' ahora es 'store.loading' -->
        <pv-button :label="t('common.save')" icon="pi pi-check" @click="saveRoom" :loading="store.loading"/>
      </template>
    </pv-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import axios from 'axios'; // Mantenido para Cloudinary

// --- Importa el STORE ---
import { usePropertyStore } from '../../application/Property.store.js';

// --- Importa componentes PrimeVue (idéntico a tu v1) ---
// ... (todos los imports de primevue)
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
import Tooltip from 'primevue/tooltip';
// ...

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// --- Instancia STORE ---
const store = usePropertyStore();

// --- Estado LOCAL de la Vista (Filtros, Paginación, Diálogo) ---
// (Esta lógica se mantiene en la vista, no pertenece al estado global)
// const rooms = ref([]); // <-- AHORA VIVE EN EL STORE (store.rooms)
// const allProperties = ref([]); // <-- AHORA VIVE EN EL STORE (store.properties)
// const loading = ref(true); // <-- AHORA VIVE EN EL STORE (store.loading)
// const saving = ref(false); // <-- AHORA VIVE EN EL STORE (store.loading)
const displayDialog = ref(false);
const selectedRoom = ref({ amenities: {} });
const isNewRoom = ref(false);
const submitted = ref(false);
const imagePreview = ref(null);
const layout = ref('grid');
const layoutOptions = ref([/* ... */]);
const defaultImage = 'https://placehold.co/300x200/cccccc/ffffff?text=No+Image';
const newImageFile = ref(null);
const first = ref(0);
const rowsPerPage = ref(6);
const filterSearchTerm = ref('');
const filterProperty = ref(null);
const filterStatus = ref(null);
const filterStatusOptions = computed(() => [/* ... */]);
const roomStatusOptions = computed(() => [/* ... */]);
const dialogHeader = computed(() => { /* ... */ });

// --- Carga de Datos (Llama al Store) ---
onMounted(() => {
  loadRooms(); // El store cargará rooms y properties
});

async function loadRooms() {
  console.log('AdminManageRooms: Llamando a store.fetchAllData...');
  try {
    await store.fetchAllData(); // Esta acción carga rooms Y properties
  } catch (error) {
    // El store ya maneja el toast de error
    console.error("Error (vista) al cargar datos:", error);
  }
}

// --- Lógica de Filtros y Paginación (Usa datos del Store) ---
const enrichedRooms = computed(() => {
  // Usa los getters del store (o la lógica local si se prefiere)
  if (!store.rooms.length || !store.properties.length) return store.rooms;
  return store.rooms.map(room => {
    const property = store.properties.find(p => p.id === room.propertyId);
    return {
      ...room,
      propertyName: property?.name || 'Hotel Desconocido'
    };
  });
});

const filteredRooms = computed(() => {
  let tempRooms = enrichedRooms.value; // Empieza con datos del store
  const query = filterSearchTerm.value.toLowerCase().trim();
  if (query) { /* ... (lógica de filtro igual) ... */ }
  if (filterProperty.value) { /* ... (lógica de filtro igual) ... */ }
  if (filterStatus.value) { /* ... (lógica de filtro igual) ... */ }
  return tempRooms;
});

const paginatedRooms = computed(() => {
  if (!filteredRooms.value || filteredRooms.value.length === 0) return [];
  const startIndex = first.value;
  return filteredRooms.value.slice(startIndex, startIndex + rowsPerPage.value);
});

function onPage(event) {
  first.value = event.first;
  window.scrollTo(0, 0);
}

// --- Lógica del Diálogo (Llama al Store) ---
function openNew() { /* ... (igual que v1) ... */ }
function editRoom(room) { /* ... (igual que v1) ... */ }
function hideDialog() { /* ... (igual que v1) ... */ }

async function saveRoom() {
  submitted.value = true;
  if (!selectedRoom.value.number?.trim() /* ... (validación igual) ... */) {
    toast.add({ /* ... */ });
    return;
  }

  const roomDataToSave = { ...selectedRoom.value };

  try {
    // Lógica de Cloudinary (se mantiene igual, es externa)
    if (newImageFile.value) {
      console.log('Subiendo a Cloudinary...');
      const formData = new FormData();
      formData.append('file', newImageFile.value);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      // ... (resto de lógica Cloudinary) ...
      const response = await axios.post(uploadUrl, formData);
      roomDataToSave.image_url = response.data.secure_url;
    } else if (isNewRoom.value && !roomDataToSave.image_url) {
      roomDataToSave.image_url = defaultImage;
    }

    // --- LLAMADA AL STORE ---
    if (isNewRoom.value) {
      await store.createRoom(roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.createSuccess'), life: 3000 });
    } else {
      await store.updateRoom(selectedRoom.value.id, roomDataToSave);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.updateSuccess'), life: 3000 });
    }
    // El store se encarga de recargar la lista
    hideDialog();

  } catch (error) {
    console.error("Error en saveRoom (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 4000 });
  }
  // 'saving' es manejado por 'store.loading'
}

function confirmDeleteRoom(room) {
  confirm.require({
    // ... (lógica de confirmación igual)
    accept: async () => { await deleteRoom(room.id); },
    // ...
  });
}

async function deleteRoom(roomId) {
  console.log(`Llamando a store.deleteRoom ${roomId}...`);
  try {
    await store.deleteRoom(roomId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('adminManageRooms.deleteSuccess'), life: 3000 });
    // El store recarga la lista
  } catch (error) {
    console.error("Error deleting room (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.deleteError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

function handleImageUpload(event) { /* ... (igual que v1) ... */ }
function getStatusSeverity(status) { /* ... (igual que v1) ... */ }
function goBackToDashboard() { router.push({ name: 'admin-dashboard' }); }
const vTooltip = Tooltip;
</script>

<style scoped>
/* ... (Estilos iguales a tu v1) ... */
</style>