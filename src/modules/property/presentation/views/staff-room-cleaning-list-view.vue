<!-- El <template> de tu v1 'StaffRoomCleaningList.vue' es perfecto. -->
<!-- Solo cambiamos las variables para que apunten al Store. -->
<template>
  <div class="p-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <!-- ... (Botón Volver) ... -->
      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshRooms"
          :loading="store.loading" <!-- Usa store.loading -->
      />
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <!-- 'stats' (computada local) usa datos del store -->
      <div v-for="stat in stats" ...>
        <!-- ... -->
      </div>
    </div>

    <!-- Loader -->
    <div v-if="store.loading" class="text-gray-500 text-center py-8">
      Cargando habitaciones...
    </div>

    <!-- Lista de habitaciones -->
    <!-- 'rooms' (computada local) usa datos del store -->
    <div v-else class="grid grid-cols-1 ... gap-5">
      <div v-for="room in rooms" :key="room.id" class="room-card ...">
        <!-- ... (Contenido del card idéntico a tu v1) ... -->

        <!-- Botones de acción -->
        <pv-button
            :icon="getButtonIcon(room.status)"
            :label="getButtonLabel(room.status)"
            :class="getButtonClass(room.status)"
            class="p-button-sm w-full mb-2"
            @click="handleStateChange(room)"
            :loading="loadingStates[room.id]" <!-- Usa estado de carga local -->
        />
        <pv-button
            v-if="room.status !== 'maintenance'"
            icon="pi pi-wrench"
            label="Marcar en Mantenimiento"
            class="p-button-help p-button-sm w-full"
            @click="markAsMaintenance(room)"
            :loading="loadingStates[room.id]" <!-- Usa estado de carga local -->
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"; // 'ref' añadido
import { useRouter } from "vue-router";
import PvButton from "primevue/button";
import { useI18n } from 'vue-i18n'; // Añadido para t()

// --- Importar el STORE ---
import { usePropertyStore } from "../application/Property.store.js";

const router = useRouter();
const store = usePropertyStore();
const { t } = useI18n(); // Para traducciones

// Estado local para los loaders de botones individuales
const loadingStates = ref({});

// ID del staff (obtenido de localStorage, igual que en v1 'StaffTaskList')
const staffId = ref(null);
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    staffId.value = JSON.parse(storedUser).id;
  }
  refreshRooms();
});

async function refreshRooms() {
  if (staffId.value) {
    await store.fetchStaffData(staffId.value);
  }
}

function goBack() {
  router.push({ name: "staff-dashboard" });
}

// --- Lógica de Botones (Modificada de v1 'useRoomData.js') ---
// (Esta lógica se mantiene en la vista, ya que es interacción pura)

async function updateRoomStatus(id, newStatus) {
  loadingStates.value[id] = true; // Activa loader individual
  try {
    // Llama a la acción del store
    // Pasamos staffId para que el store sepa qué data recargar
    await store.updateTaskStatus(id, newStatus, staffId.value);
  } catch (err) {
    console.error(`Error updating room ${id} status:`, err);
    // (El store debería manejar el toast de error)
  } finally {
    loadingStates.value[id] = false; // Desactiva loader individual
  }
}

async function handleStateChange(room) {
  let newStatus = room.status;
  switch (room.status) {
    case "available": newStatus = "occupied"; break;
    case "occupied": newStatus = "cleaning"; break;
    case "cleaning": newStatus = "available"; break;
    case "maintenance": newStatus = "available"; break;
  }
  await updateRoomStatus(room.id, newStatus);
}

async function markAsMaintenance(room) {
  await updateRoomStatus(room.id, "maintenance");
}


// --- Computadas (Usan datos del Store) ---

// 'rooms' ahora se filtra localmente desde el store
const rooms = computed(() => store.rooms);

const stats = computed(() => {
  // Usa store.rooms como fuente
  const available = store.rooms.filter((r) => r.status === "available").length;
  const cleaning = store.rooms.filter((r) => r.status === "cleaning").length;
  const occupied = store.rooms.filter((r) => r.status === "occupied").length;
  const maintenance = store.rooms.filter((r) => r.status === "maintenance").length;

  return [
    { label: t('roomStatus.available'), count: available, color: "text-green-600" },
    { label: t('roomStatus.cleaning'), count: cleaning, color: "text-yellow-600" },
    { label: t('roomStatus.occupied'), count: occupied, color: "text-blue-600" },
    { label: t('roomStatus.maintenance'), count: maintenance, color: "text-red-600" },
  ];
});

// --- Helpers (Iguales a v1) ---
function getBadgeColor(status) { /* ... */ }
function traducirEstado(status) {
  return t(`roomStatus.${status || 'unknown'}`);
}
function getButtonLabel(status) {
  const keyMap = {
    available: "staffCleaning.btnMarkOccupied",
    occupied: "staffCleaning.btnMarkCleaning",
    cleaning: "staffCleaning.btnMarkAvailable",
    maintenance: "staffCleaning.btnMarkDone",
  };
  return t(keyMap[status] || 'common.noAction');
}
function getButtonIcon(status) { /* ... */ }
function getButtonClass(status) { /* ... */ }

</script>

<style scoped>
/* (Estilos de tu v1) */
.room-card {
  transition: all 0.25s ease-in-out;
}
.room-card:hover {
  transform: translateY(-3px);
}
.room-card img {
  width: 100%;
  height: 7rem;
  object-fit: cover;
}
</style>