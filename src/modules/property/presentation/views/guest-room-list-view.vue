<!-- El <template> de tu v1 'GuestRoomList.vue' es perfecto. -->
<!-- Solo cambiamos las variables para que apunten al Store. -->
<template>
  <div class="p-6 max-w-7xl mx-auto">

    <!-- ... (Encabezado y Botón de Volver) ... -->
    <pv-button
        icon="pi pi-refresh"
        label="Actualizar"
        class="p-button-sm"
        @click="refreshRooms"
        :loading="store.loading" <!-- Usa store.loading -->
    />
    <!-- ... -->

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 ...">
      <div>
        <!-- ... (Select de Hotel) ... -->
        <pv-select
            v-model="selectedHotel"
            :options="store.properties" <!-- Usa store.properties -->
        optionLabel="name"
        optionValue="id"
        ...
        />
      </div>
      <div>
        <!-- ... (Input de Búsqueda) ... -->
      </div>
      <div>
        <!-- ... (Slider de Precio) ... -->
      </div>
    </div>

    <!-- Loader -->
    <div v-if="store.loading" class="text-gray-500 text-center py-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p class="mt-2">Buscando habitaciones...</p>
    </div>

    <!-- Grid de Cuartos -->
    <!-- Usa 'filteredRooms' (computada local) -->
    <div
        v-else-if="filteredRooms.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
    >
      <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card ..."
      >
        <!-- ... (Contenido del card idéntico a tu v1) ... -->
      </div>
    </div>

    <!-- Mensaje de Vacío -->
    <div v-else class="text-gray-500 text-center py-8">
      No se encontraron habitaciones disponibles con esos filtros.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Añadido 'computed'
import { useRouter } from 'vue-router'; // Añadido 'useRouter'
import PvButton from 'primevue/button';
import PvInputText from 'primevue/inputtext';
import PvSlider from 'primevue/slider';
import PvSelect from 'primevue/select';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";

// --- Importar el STORE ---
import { usePropertyStore } from '../application/Property.store.js';

// --- Inicializar hooks ---
const store = usePropertyStore();
const router = useRouter(); // Para la navegación

// --- Estado LOCAL de la Vista (Filtros) ---
// (Esta lógica pertenece a la vista, no al store global)
const searchTerm = ref('');
const selectedHotel = ref(null);
const priceRange = ref([0, 500]);
const priceSliderMax = ref(500); // Max del slider

// --- Carga de Datos (Llama al Store) ---
onMounted(() => {
  refreshRooms(); // Carga inicial
});

async function refreshRooms() {
  await store.fetchGuestData(); // Llama a la acción del store para huéspedes
  // Ajusta el slider después de cargar
  if (store.rooms.length > 0) {
    const maxPrice = Math.max(...store.rooms.map(r => r.price));
    priceSliderMax.value = maxPrice > 500 ? Math.ceil(maxPrice / 10) * 10 : 500;
    // No sobrescribe el filtro actual
    if (priceRange.value[1] > priceSliderMax.value) {
      priceRange.value[1] = priceSliderMax.value;
    }
  }
}

// --- Lógica de Filtros (Computada local, usa datos del Store) ---
const filteredRooms = computed(() => {
  // Usa el getter del store 'availableRooms' como base
  let rooms = store.availableRooms;

  // Preparamos los filtros
  const query = searchTerm.value.toLowerCase().trim();
  const minPrice = priceRange.value[0];
  const maxPrice = priceRange.value[1];
  const hotelId = selectedHotel.value;

  // 1. Aplicar filtro de Hotel
  if (hotelId) {
    rooms = rooms.filter(r => r.propertyId === hotelId);
  }
  // 2. Aplicar filtro de Precio
  rooms = rooms.filter(r => r.price >= minPrice && r.price <= maxPrice);
  // 3. Aplicar filtro de Texto
  if (query) {
    rooms = rooms.filter(
        r => (r.type && r.type.toLowerCase().includes(query)) ||
            (r.name && r.name.toLowerCase().includes(query))
    );
  }

  // 5. "Pase Químico" (Enriquecer)
  // (Re-enriquecemos solo los filtrados, o usamos un getter del store)
  return rooms.map(room => {
    const property = store.properties.find(p => p.id === room.propertyId);
    return {
      ...room,
      propertyName: property?.name || 'Hotel Desconocido',
      propertyLocation: property?.location || 'Sin ubicación'
    };
  });
});


// --- Acciones de Navegación ---
function goToProperty(propertyId) {
  // Esta ruta no está en tu v1, pero la lógica de 'useGuestRoomList' la tenía
  // router.push({ name: 'guest-property-details', params: { id: propertyId } });
  console.log("Ir a detalles de propiedad:", propertyId);
}
function goBackToDashboard() {
  router.push({ name: 'guest-dashboard' }); // Asume que tienes esta ruta
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
.w-20rem { width: 20rem; }
.h-40 { height: 10rem; } /* 160px */
.bg-gray-100 { background-color: #f3f4f6; }
.object-cover { object-fit: cover; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-4 { padding: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-normal { font-weight: 400; }
.text-gray-800 { color: #1f2937; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
</style>