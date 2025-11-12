<template>
  <div class="p-6 max-w-3xl mx-auto">
    <pv-toast />

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-primary">Confirmar tu Reserva</h1>
      <p class="text-gray-600">Estás a un paso de asegurar tu estadía.</p>
    </div>

    <div v-if="propertyStore.loading" class="text-center py-16">
      <pv-progress-spinner />
      <p class="text-gray-500 mt-4">Cargando detalles...</p>
    </div>

    <div v-else-if="error" class="text-center py-16">
      <i class="pi pi-times-circle text-red-500 text-4xl mb-3"></i>
      <h2 class="text-xl font-semibold text-red-600">Error</h2>
      <p class="text-gray-600">{{ error }}</p>
      <pv-button label="Volver" icon="pi pi-arrow-left" class="p-button-outlined mt-4" @click="$router.go(-1)" />
    </div>

    <!-- USA LOS GETTERS DEL PROPERTY STORE -->
    <div v-else-if="property && room" class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <div class="bg-white p-4 rounded-lg shadow-md border mb-6">
          <h2 class="text-lg font-semibold">{{ property.name }}</h2>
          <p class="text-gray-700 font-bold text-primary">{{ room.name || `Habitación #${room.number}` }}</p>
          <p class="text-sm text-gray-600">{{ room.type }}</p>
          <p class="text-2xl font-bold mt-2">${{ room.price }} <span class="text-base font-normal text-gray-500">/ noche</span></p>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md border">
          <h3 class="font-semibold mb-2">Selecciona tus fechas</h3>
          <pv-date-picker v-model="dates"
                          selectionMode="range"
                          inline
                          :minDate="minDate"
                          dateFormat="dd/mm/yy"
                          class="w-full"
          />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg border h-fit">
        <h2 class="text-xl font-bold mb-4">Resumen de la Reserva</h2>

        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">Check-in:</span>
          <span class="font-medium">{{ dates && dates[0] ? dates[0].toLocaleDateString() : '---' }}</span>
        </div>
        <div class="flex justify-between items-center mb-4">
          <span class="text-gray-600">Check-out:</span>
          <span class="font-medium">{{ dates && dates[1] ? dates[1].toLocaleDateString() : '---' }}</span>
        </div>

        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600">Noches:</span>
            <span class="font-medium">{{ bookingSummary.numNights }}</span>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-600">Precio x Noche:</span>
            <span class="font-medium">${{ room.price }}</span>
          </div>

          <div class="border-t pt-4 flex justify-between items-center">
            <span class="text-xl font-bold">Total:</span>
            <span class="text-2xl font-bold text-primary">${{ bookingSummary.totalPrice }}</span>
          </div>
        </div>

        <!-- USA EL STORE DE BOOKING PARA GUARDAR -->
        <pv-button
            label="¡Reservar Ahora!"
            icon="pi pi-check"
            class="p-button-success w-full mt-6"
            :loading="bookingStore.loading"
            :disabled="bookingSummary.numNights <= 0"
            @click="handleBooking"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import PvButton from 'primevue/button';
import PvToast from 'primevue/toast';
import PvProgressSpinner from 'primevue/progressspinner';
import PvDatePicker from 'primevue/datepicker';

// --- Importar los DOS Stores ---
import { usePropertyStore } from '../../../property/application/store/property.store.js';
import { useBookingStore } from '../../application/store/Booking.store.js';

// --- Inicializar "Armas" ---
const route = useRoute();
const router = useRouter();
const toast = useToast();

// --- Instanciar Stores ---
const propertyStore = usePropertyStore();
const bookingStore = useBookingStore();

// --- Estado Local de la Vista ---
const dates = ref(null);
const error = ref(null);
const minDate = new Date(); // Para el calendario

// IDs de la URL
const { propertyId, roomId } = route.params;

// --- Carga de Datos (Usa el Store de Property) ---
onMounted(async () => {
  try {
    if (!propertyId || !roomId) throw new Error("Faltan IDs de propiedad o habitación.");

    // Llama a las acciones del store para obtener datos
    await propertyStore.fetchGuestData();

    if (propertyStore.error) throw new Error(propertyStore.error);

  } catch (err) {
    console.error("Error loading booking details (View):", err);
    error.value = "No se pudieron cargar los detalles. Intenta de nuevo.";
    toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 3000 });
  }
});

// --- "Cálculo de Tiro" (Computadas) ---

// Getter local para la propiedad (usa el store)
const property = computed(() => {
  // USA '==' PARA COMPARAR STRING ("10") CON NUMBER (10)
  return propertyStore.properties.find(p => p.id == propertyId);
});

// Getter local para la habitación (usa el store)
const room = computed(() => {
  // USA '==' PARA COMPARAR STRING ("10") CON NUMBER (10)
  return propertyStore.rooms.find(r => r.id == roomId);
});

const bookingSummary = computed(() => {
  // ... (el resto de tu lógica está bien)
  if (!dates.value || !dates.value[0] || !dates.value[1] || !room.value) {
    return { numNights: 0, totalPrice: "0.00" };
  }
  const checkIn = new Date(dates.value[0]);
  const checkOut = new Date(dates.value[1]);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const numNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (numNights <= 0) return { numNights: 0, totalPrice: "0.00" };

  const totalPrice = numNights * room.value.price;
  return { numNights, totalPrice: totalPrice.toFixed(2) };
});

// --- "Disparo a Gol" (La Acción - Usa el Store de Booking) ---
async function handleBooking() {
  // ... (el resto de tu lógica está bien)
  if (bookingSummary.value.numNights <= 0) {
    toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Por favor, selecciona un rango de fechas válido.', life: 3000 });
    return;
  }
  const guestId = JSON.parse(localStorage.getItem('user'))?.id;
  if (!guestId) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al usuario.', life: 3000 });
    return;
  }

  const bookingDetails = {
    propertyId: property.value.id,
    roomId: room.value.id,
    guestId: guestId,
    checkInDate: dates.value[0].toISOString(),
    checkOutDate: dates.value[1].toISOString(),
    totalPrice: parseFloat(bookingSummary.value.totalPrice)
  };

  try {
    await bookingStore.createBooking(bookingDetails); // Llama al Store
    toast.add({ severity: 'success', summary: '¡Éxito!', detail: 'Tu reserva ha sido confirmada.', life: 3000 });

    // "Celebración": Ir a la lista de "Mis Reservas"
    router.push({ name: 'guest-my-bookings' });

  } catch (err) {
    console.error("Error creating booking (View):", err);
    toast.add({ severity: 'error', summary: 'Error al Reservar', detail: err.message || 'No se pudo completar la reserva.', life: 3000 });
  }
}
</script>

<style scoped>
.text-primary { color: var(--primary-color); }
.p-6 { padding: 1.5rem; }
.max-w-3xl { max-width: 48rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-6 { margin-bottom: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-gray-600 { color: #4b5563; }
.text-center { text-align: center; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.text-gray-500 { color: #6b7280; }
.mt-4 { margin-top: 1rem; }
.text-red-500 { color: #ef4444; }
.text-4xl { font-size: 2.25rem; }
.mb-3 { margin-bottom: 0.75rem; }
.text-xl { font-size: 1.25rem; }
.font-semibold { font-weight: 600; }
.text-red-600 { color: #dc2626; }
.mt-4 { margin-top: 1rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.gap-6 { gap: 1.5rem; }
.bg-white { background-color: #ffffff; }
.p-4 { padding: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.border { border-width: 1px; }
.mb-6 { margin-bottom: 1.5rem; }
.text-lg { font-size: 1.125rem; }
.text-gray-700 { color: #374151; }
.text-sm { font-size: 0.875rem; }
.text-2xl { font-size: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.text-base { font-size: 1rem; }
.font-normal { font-weight: 400; }
.mb-2 { margin-bottom: 0.5rem; }
.w-full { width: 100%; }
.p-6 { padding: 1.5rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.h-fit { height: -moz-fit-content; height: fit-content; }
.mb-4 { margin-bottom: 1rem; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.font-medium { font-weight: 500; }
.border-t { border-top-width: 1px; }
.pt-4 { padding-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
</style>