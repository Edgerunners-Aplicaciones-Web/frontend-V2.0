<template>
  <div class="p-6 max-w-7xl mx-auto">

    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="p-button-outlined p-button-sm"
            @click="goBackToDashboard"
        />
        <h1 class="text-xl font-semibold text-gray-800">
          🔑 Todas las Habitaciones Disponibles
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <pv-button
            icon="pi pi-refresh"
            label="Actualizar"
            class="p-button-sm"
            @click="refreshRooms"
            :loading="store.loading"
        />
        <language-switcher />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
      <div>
        <label for="hotel-filter" class="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
        <pv-select
            id="hotel-filter"
            v-model="selectedHotel"
            :options="store.properties"
            optionLabel="name"
            optionValue="id"
            placeholder="Todos los hoteles"
            class="w-full"
            :showClear="true"
        />
      </div>
      <div>
        <label for="text-filter" class="block text-sm font-medium text-gray-700 mb-1">Buscar por tipo/nombre</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search" />
          <pv-input-text
              id="text-filter"
              v-model="searchTerm"
              placeholder="Ej: Suite, Doble..."
              class="w-full"
          />
        </span>
      </div>
      <div>
        <label for="price-filter" class="block text-sm font-medium text-gray-700 mb-1">
          Precio: ${{ priceRange[0] }} - ${{ priceRange[1] }}
        </label>
        <pv-slider
            id="price-filter"
            v-model="priceRange"
            :range="true"
            :min="0"
            :max="priceSliderMax"
            :step="10"
            class="w-full pt-2"
        />
      </div>
    </div>

    <div v-if="store.loading" class="text-gray-500 text-center py-8">
    </div>

    <div
        v-else-if="filteredRooms.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
      >
        <div class="relative w-full h-40 bg-gray-100">
          <img
              :src="room.image_url || 'https://placehold.co/300x200'"
              :alt="room.type"
              class="object-cover w-full h-full"
          />
          <span
              class="absolute bottom-0 left-0 right-0 p-2 text-xs font-bold text-white bg-black bg-opacity-50 truncate"
              :title="room.propertyName"
          >
            <i class="pi pi-building"></i> {{ room.propertyName }}
          </span>
        </div>

        <div class="p-4">
          <h2 class="font-bold text-lg text-gray-800 mb-1 truncate" :title="room.name || `Habitación ${room.number}`">
            {{ room.name || `Habitación ${room.number}` }}
          </h2>
          <p class="text-sm text-gray-600 mb-2">
            Tipo: {{ room.type }}
          </p>
          <p class="text-lg font-semibold text-primary mb-4">
            ${{ room.price }} <span class="text-xs text-gray-500 font-normal">/ noche</span>
          </p>

          <pv-button
              icon="pi pi-calendar-plus"
              label="Reservar"
              class="p-button-success p-button-sm w-full"
              @click="goToBooking(room)"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-8">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PvButton from 'primevue/button';
import PvInputText from 'primevue/inputtext';
import PvSlider from 'primevue/slider';
import PvSelect from 'primevue/select';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";

// --- Importar el STORE ---
import { usePropertyStore } from '../../application/store/property.store.js';

// --- Inicializar hooks ---
const store = usePropertyStore();
const router = useRouter(); // Para la navegación

// --- Estado LOCAL de la Vista (Filtros) ---
const searchTerm = ref('');
const selectedHotel = ref(null);
const priceRange = ref([0, 500]);
const priceSliderMax = ref(500); // Max del slider

// --- Carga de Datos (Sin Cambios) ---
onMounted(() => {
  refreshRooms();
});

async function refreshRooms() {
  await store.fetchGuestData();
  if (store.rooms.length > 0) {
    const maxPrice = Math.max(...store.rooms.map(r => r.price));
    priceSliderMax.value = maxPrice > 500 ? Math.ceil(maxPrice / 10) * 10 : 500;
    if (priceRange.value[1] > priceSliderMax.value) {
      priceRange.value[1] = priceSliderMax.value;
    }
  }
}

// --- Lógica de Filtros (Sin Cambios) ---
const filteredRooms = computed(() => {
  let rooms = store.availableRooms;
  const query = searchTerm.value.toLowerCase().trim();
  const minPrice = priceRange.value[0];
  const maxPrice = priceRange.value[1];
  const hotelId = selectedHotel.value;

  if (hotelId) {
    rooms = rooms.filter(r => r.propertyId === hotelId);
  }
  if (minPrice > 0 || maxPrice < priceSliderMax.value) { // Corregido para que el filtro de precio funcione
    rooms = rooms.filter(r => r.price >= minPrice && r.price <= maxPrice);
  }
  if (query) {
    rooms = rooms.filter(
        r => (r.type && r.type.toLowerCase().includes(query)) ||
            (r.name && r.name.toLowerCase().includes(query))
    );
  }

  return rooms.map(room => {
    const property = store.properties.find(p => p.id === room.propertyId);
    return {
      ...room,
      propertyName: property?.name || 'Hotel Desconocido',
      propertyLocation: property?.location || 'Sin ubicación'
    };
  });
});


function goToBooking(room) {
  console.log(`Iniciando "fórmula de reserva" para: Propiedad ${room.propertyId}, Cuarto ${room.id}`);
  router.push({
    name: 'guest-create-booking',
    params: {
      propertyId: room.propertyId, // El "pase" (parámetro) 1
      roomId: room.id                // El "pase" (parámetro) 2
    }
  });
}

function goBackToDashboard() {
  router.push({ name: 'guest-dashboard' });
}
</script>

<style scoped>
/* (Estilos de tu v1) */
.room-card {
  transition: all 0.25s ease-in-out;
}
.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.text-primary {
  color: var(--primary-color);
}
/* .w-20rem { width: 20rem; } */ /* Reemplazado por w-full */
.h-40 { height: 10rem; }
.bg-gray-100 { background-color: #f3f4f6; }
.object-cover { object-fit: cover; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.text-lg { font-size: 1.125rem; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-normal { font-weight: 400; }
.text-gray-800 { color: #1f2937; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }
.mx-auto { margin-left: auto; margin-right: auto; }
.max-w-7xl { max-width: 80rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-2 { gap: 0.5rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 768px) {
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.p-4 { padding: 1rem; }
.bg-gray-50 { background-color: #f9fafb; }
.rounded-lg { border-radius: 0.5rem; }
.border { border-width: 1px; }
.block { display: block; }
.font-medium { font-weight: 500; }
.mb-1 { margin-bottom: 0.25rem; }
.p-input-icon-left { position: relative; }
.p-input-icon-left > .pi { position: absolute; top: 50%; transform: translateY(-50%); left: 0.75rem; }
.p-input-icon-left > .p-inputtext { padding-left: 2.5rem; }
.pt-2 { padding-top: 0.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
@media (min-width: 640px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.gap-5 { gap: 1.25rem; }
.rounded-xl { border-radius: 0.75rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.overflow-hidden { overflow: hidden; }
.border-gray-100 { border-color: #f3f4f6; }
.relative { position: relative; }
.absolute { position: absolute; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.p-2 { padding: 0.5rem; }
.text-white { color: #ffffff; }
.bg-black { background-color: #000000; }
.bg-opacity-50 { background-color: rgba(0, 0, 0, 0.5); }
</style>