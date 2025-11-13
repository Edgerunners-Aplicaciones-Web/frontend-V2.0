<template>
  <div class="p-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver al Dashboard"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h1 class="text-xl font-semibold text-gray-800">
          🧹 Gestión de Habitaciones del Staff
        </h1>
      </div>

      <pv-button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-sm"
          @click="refreshRooms"
          :loading="store.loading"
      />
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <!-- 'stats' (computada local) usa datos del store -->
      <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl p-4 text-center shadow-sm border border-gray-100 bg-white"
      >
        <p class="text-sm text-gray-500">{{ stat.label }}</p>
        <p :class="['text-lg font-bold', stat.color]">{{ stat.count }}</p>
      </div>
    </div>


    <div v-if="store.loading" class="text-gray-500 text-center py-8">
      Cargando habitaciones...
    </div>

    <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="room in rooms"
          :key="room.id"
          class="room-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
      >
        <!-- Imagen -->
        <div class="relative w-full h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
              v-if="room.image_url"
              :src="room.image_url"
              :alt="`Habitación ${room.number}`"
              class="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
          />
          <div v-else class="text-gray-400 italic text-sm">Sin imagen</div>

          <span
              class="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-md text-white"
              :class="getBadgeColor(room.status)"
          >
            {{ traducirEstado(room.status) }}
          </span>
        </div>

        <div class="p-3">
          <h2 class="font-bold text-base text-gray-800 mb-1 truncate">
            Habitación #{{ room.number }}
          </h2>

          <p class="text-xs text-gray-600 mb-1">
            Tipo: {{ room.type }}
          </p>

          <p class="text-sm font-semibold text-blue-600 mb-3">
            Precio: ${{ room.price }}
          </p>

          <pv-button
              :icon="getButtonIcon(room.status)"
              :label="getButtonLabel(room.status)"
              :class="getButtonClass(room.status)"
              class="p-button-sm w-full mb-2"
              @click="handleStateChange(room)"
              :loading="loadingStates[room.id]"
          />

          <!-- Botón de mantenimiento adicional -->
          <pv-button
              v-if="room.status !== 'maintenance'"
              icon="pi pi-wrench"
              label="Marcar en Mantenimiento"
              class="p-button-help p-button-sm w-full"
              @click="markAsMaintenance(room)"
              :loading="loadingStates[room.id]"
          />
        </div>
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
import { usePropertyStore } from "../../application/store/property.store.js";

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
    // NOTA: updateTaskStatus actualiza una TAREA, necesitamos updateRoomStatus
    // Vamos a asumir que el store tiene `updateRoomStatus`

    // --- INICIO CORRECCIÓN LÓGICA ---
    // Tu v1 llamaba a `updateRoom` (de room-service)
    // El store v2 tiene `updateRoom(roomId, roomData)`
    // ¡Usaremos esa!
    await store.updateRoom(id, { status: newStatus });
    // La acción `updateRoom` en el store v2 recarga con `fetchAllData`,
    // deberíamos ajustarla para que recargue con `fetchStaffData` si es posible,
    // pero por ahora, esto funcionará (aunque recarga más de lo necesario).
    // --- FIN CORRECCIÓN LÓGICA ---

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

const rooms = computed(() =>
    store.rooms.filter(r => ['cleaning', 'dirty', 'maintenance', 'Por limpiar', 'Revisión pendiente'].includes(r.status))
);

const stats = computed(() => {
  // Usa store.rooms como fuente
  const available = store.rooms.filter((r) => r.status === "available").length;
  const cleaning = store.rooms.filter((r) => r.status === "cleaning" || r.status === 'Por limpiar').length;
  const occupied = store.rooms.filter((r) => r.status === "occupied").length;
  const maintenance = store.rooms.filter((r) => r.status === "maintenance" || r.status === 'Revisión pendiente').length;

  // Ajusta las etiquetas para que coincidan con la lógica
  return [
    { label: t('roomStatus.available'), count: available, color: "text-green-600" },
    { label: t('roomStatus.cleaning'), count: cleaning, color: "text-yellow-600" },
    { label: t('roomStatus.occupied'), count: occupied, color: "text-blue-600" },
    { label: t('roomStatus.maintenance'), count: maintenance, color: "text-red-600" },
  ];
});

// --- Helpers (Iguales a v1) ---
function getBadgeColor(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'available': return 'bg-green-600';
    case 'cleaning': return 'bg-yellow-500';
    case 'por limpiar': return 'bg-yellow-500';
    case 'occupied': return 'bg-blue-600';
    case 'maintenance': return 'bg-red-600';
    case 'revisión pendiente': return 'bg-red-600';
    default: return 'bg-gray-500';
  }
}
function traducirEstado(status) {
  return t(`roomStatus.${status?.toLowerCase() || 'unknown'}`);
}
function getButtonLabel(status) {
  const s = status?.toLowerCase();
  const keyMap = {
    available: "staffCleaning.btnMarkOccupied",
    occupied: "staffCleaning.btnMarkCleaning",
    cleaning: "staffCleaning.btnMarkAvailable",
    'por limpiar': "staffCleaning.btnMarkAvailable",
    maintenance: "staffCleaning.btnMarkDone",
    'revisión pendiente': "staffCleaning.btnMarkDone",
  };
  return t(keyMap[s] || 'common.noAction');
}
function getButtonIcon(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case "available": return "pi pi-user";
    case "occupied": return "pi pi-broom";
    case "cleaning": return "pi pi-check";
    case "por limpiar": return "pi pi-check";
    case "maintenance": return "pi pi-wrench";
    case "revisión pendiente": return "pi pi-wrench";
    default: return "pi pi-info-circle";
  }
}
function getButtonClass(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case "available": return "p-button-info";
    case "occupied": return "p-button-warning";
    case "cleaning": return "p-button-success";
    case "por limpiar": return "p-button-success";
    case "maintenance": return "p-button-secondary";
    case "revisión pendiente": return "p-button-secondary";
    default: return "p-button-outlined";
  }
}
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
.p-6 { padding: 1.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-6 { margin-bottom: 1.5rem; }
.gap-3 { gap: 0.75rem; }
.text-xl { font-size: 1.25rem; }
.font-semibold { font-weight: 600; }
.text-gray-800 { color: #1f2937; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.md\:grid-cols-4 { @media (min-width: 768px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mb-8 { margin-bottom: 2rem; }
.rounded-xl { border-radius: 0.75rem; }
.p-4 { padding: 1rem; }
.text-center { text-align: center; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.bg-white { background-color: #ffffff; }
.text-sm { font-size: 0.875rem; }
.text-gray-500 { color: #6b7280; }
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }
.text-green-600 { color: #16a34a; }
.text-yellow-600 { color: #d97706; }
.text-blue-600 { color: #2563eb; }
.text-red-600 { color: #dc2626; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.sm\:grid-cols-2 { @media (min-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.md\:grid-cols-3 { @media (min-width: 768px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.lg\:grid-cols-4 { @media (min-width: 1024px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.gap-5 { gap: 1.25rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.overflow-hidden { overflow: hidden; }
.relative { position: relative; }
.w-full { width: 100%; }
.h-28 { height: 7rem; }
.bg-gray-100 { background-color: #f3f4f6; }
.justify-center { justify-content: center; }
.italic { font-style: italic; }
.text-gray-400 { color: #9ca3af; }
.object-cover { object-fit: cover; }
.h-full { height: 100%; }
.transition-transform { transition-property: transform; }
.duration-200 { transition-duration: 200ms; }
.hover\:scale-105:hover { transform: scale(1.05); }
.absolute { position: absolute; }
.top-2 { top: 0.5rem; }
.left-2 { left: 0.5rem; }
.text-xs { font-size: 0.75rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.text-white { color: #ffffff; }
.p-3 { padding: 0.75rem; }
.text-base { font-size: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-gray-600 { color: #4b5563; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
</style>