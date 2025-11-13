<template>
  <div class="p-6 max-w-6xl mx-auto">
    <pv-toast position="bottom-right" />
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-primary mb-1">🛏️ {{ t('guestDashboard.title') }}</h1>
        <p class="text-sm text-gray-600">{{ t('guestDashboard.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <pv-button
            icon="pi pi-home"
            :label="t('guestDashboard.viewProperties')"
            class="p-button-outlined"
            @click="goToProperties"
        />
        <pv-button
            icon="pi pi-calendar"
            :label="t('guestDashboard.myBookings')"
            class="p-button-secondary"
            @click="goToBookings"
        />
        <pv-button
            icon="pi pi-key"
            label="Ver Habitaciones"
            class="p-button-info p-button-outlined"
            @click="goToRooms"
        />
        <pv-button icon="pi pi-sign-out" :label="t('dashboard.logoutButton')" class="p-button-danger" @click="logout" />
      </div>

      <language-switcher></language-switcher>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.upcomingBookings') }}</p>
        <p class="text-2xl font-bold">{{ store.guestStats.simpleStats.upcoming }}</p>
      </div>
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.activeServices') }}</p>
        <p class="text-2xl font-bold">{{ store.guestStats.simpleStats.services }}</p>
      </div>
      <div class="rounded-lg border p-4 bg-white shadow-sm">
        <p class="text-xs text-gray-500">{{ t('guestDashboard.recommendations') }}</p>
        <p class="text-2xl font-bold">{{ store.guestStats.recommendations.length }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <pv-card class="bg-white">
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.upcomingBookings') }}</span>
            <pv-button class="p-button-text" :label="t('guestDashboard.viewAll')" @click="goToBookings" />
          </div>
        </template>

        <template #content>
          <div v-if="store.loading" class="text-center py-8">{{ t('common.loading') }}</div>
          <div v-else>
            <div v-if="store.guestStats.upcomingBookings.length === 0" class="text-gray-500 italic">
              {{ t('guestDashboard.noUpcoming') }}
            </div>

            <ul v-else class="space-y-3">
              <li v-for="b in store.guestStats.upcomingBookings" :key="b.id" class="p-3 border rounded-md flex items-start justify-between gap-3">
                <div>
                  <div class="font-semibold">#{{ getRoomNumber(b.roomId) }} — {{ b.propertyName || b.propertyId }}</div>
                  <div class="text-xs text-gray-600">
                    {{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">Estado: <strong>{{ translateBookingStatus(b.status) }}</strong></div>
                </div>

                <div class="flex flex-col items-end gap-2">
                  <pv-button v-if="canCancel(b)" size="small" class="p-button-danger p-button-sm" icon="pi pi-times" :label="t('guestDashboard.cancel')" @click="cancelBooking(b)" />
                  <pv-button v-else size="small" class="p-button-outlined p-button-sm" icon="pi pi-info-circle" :label="t('guestDashboard.details')" @click="openBooking(b)" />
                </div>
              </li>
            </ul>
          </div>
        </template>
      </pv-card>

      <pv-card class="bg-white">
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.recommendationsTitle') }}</span>
            <pv-button class="p-button-text" :label="t('guestDashboard.refresh')" @click="loadData" />
          </div>
        </template>

        <template #content>
          <div class="mb-3">
            <p class="text-sm text-gray-600">{{ t('guestDashboard.recommendationsSubtitle') }}</p>
          </div>

          <div v-if="store.guestStats.recommendations.length === 0" class="text-gray-500 italic">
            {{ t('guestDashboard.noRecommendations') }}
          </div>

          <ul v-else class="space-y-2">
            <li v-for="(r, idx) in store.guestStats.recommendations" :key="idx" class="p-3 border rounded-md flex justify-between items-center">
              <div>
                <div class="font-medium">{{ r.title }}</div>
                <div class="text-xs text-gray-600">{{ r.description }}</div>
              </div>
              <pv-button class="p-button-sm" icon="pi pi-arrow-right" @click="goToProperty(r.propertyId)" />
            </li>
          </ul>

          <div class="mt-4">
            <h4 class="font-semibold mb-2">{{ t('guestDashboard.quickServices') }}</h4>
            <div class="flex gap-2 flex-wrap">
              <pv-button icon="pi pi-concierge-bell" :label="t('guestDashboard.requestService')" class="p-button-info" @click="requestService" />
              <pv-button icon="pi pi-comment" :label="t('guestDashboard.leaveReview')" class="p-button-outlined" @click="goToReview" />
              <pv-button icon="pi pi-map-marker" :label="t('guestDashboard.viewMap')" class="p-button-secondary" @click="goToProperties" />
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <div class="mt-6">
      <pv-card :pt="{ content: { class: 'p-0' } }">

        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-semibold">{{ t('guestDashboard.recentProperties') }}</span>
            <pv-button
                class="p-button-text"
                :label="t('guestDashboard.viewAll')"
                @click="goToProperties"
            />
          </div>
        </template>

        <template #content>
          <div v-if="store.loading || !store.guestStats.recentProperties.length" class="text-gray-500 italic p-4"> {{ store.loading ? 'Cargando...' : t('guestDashboard.noProperties') }}
          </div>

          <pv-carousel
              v-else
              :value="store.guestStats.recentProperties"
              :numVisible="3" :numScroll="1"
              :circular="true"
              :autoplayInterval="4000"
              :responsiveOptions="responsiveOptions"
              class="pb-2">
            <template #item="slotProps">
              <div
                  class="border rounded-lg shadow-sm overflow-hidden bg-white m-2 cursor-pointer hover:shadow-md transition-all duration-200"
                  @click="goToProperty(slotProps.data.id)"
              >
                <img
                    :src="slotProps.data.image_url || placeholderImg"
                    alt="property image"
                    class="carousel-img"
                />

                <div class="p-3">
                  <div class="font-medium text-sm truncate" :title="slotProps.data.name">
                    {{ slotProps.data.name }}
                  </div>
                  <div class="text-xs text-gray-600 truncate">
                    {{ slotProps.data.location }}
                  </div>
                </div>
              </div>
            </template>
          </pv-carousel>

        </template>
      </pv-card>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, computed } from 'vue'; // 'computed' añadido
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../../shared/application/store/user_store.js';
import { useToast } from 'primevue/usetoast'; // Añadido para 'cancelBooking'

// --- Importa el STORE ---
import { useAnalyticsStore } from "../../application/store/analytics.store.js"; // Ruta Corregida

// --- Importa Componentes PrimeVue (idéntico a v1) ---
import PvButton from 'primevue/button';
import PvCard from 'primevue/card';
import PvCarousel from 'primevue/carousel';
import PvToast from 'primevue/toast';
// ...
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";

// --- Inicializa "Armas" ---
const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const toast = useToast(); // Para 'cancelBooking'

// --- Instancia el STORE ---
const store = useAnalyticsStore();
// (Aquí también necesitaríamos el BookingStore para 'cancelBooking')
// import { useBookingStore } from '../../../bookings/application/Booking.store.js';
// const bookingStore = useBookingStore();

// --- Estado local (para el Carousel) ---
const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 2
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }
]);
const placeholderImg = "/assets/logo-modo-oscuro.png"; // (Tomado de v1)

// --- Carga de Datos (Llama al Store) ---
onMounted(loadData);
onActivated(loadData);

async function loadData() {
  const stored = localStorage.getItem("user");
  const userId = stored ? JSON.parse(stored).id : null;
  if (!userId) {
    toast.add({ severity: "error", summary: "Error de Autenticación", detail: "No se encontró ID de usuario.", life: 4000 });
    logout(); // Forzar salida
    return;
  }
  await store.fetchGuestStats(userId);
}

// --- "Tácticas" (Funciones de la Vista) ---
// (Estas funciones se quedan en la vista porque son lógica de UI)

// Navegación
function goToBookings() { router.push({ name: "guest-my-bookings" }); } // Asumiendo que esta ruta existirá
function goToProperties() { router.push({ name: "guest-rooms-list" }); } // Corregido de 'guest-properties-list'
function goToRooms() { router.push({ name: 'guest-rooms-list' }); }
function goToReview() { /* router.push({ name: "guest-review-form" }); */ }
function goToProperty(propertyId) { /* router.push({ name: "guest-properties-details", params: { id: propertyId } }); */ }
function openBooking(booking) { /* router.push({ name: "guest-bookings-details", params: { id: bookings.id } }); */ }
function requestService() { console.log("Request service..."); }

// Acciones
async function cancelBooking(booking) {
  // ESTA ACCIÓN PERTENECE AL 'Booking' Bounded Context.
  // Cuando lo tengas, llamarías a:
  // await bookingStore.cancelBooking(bookings.id);
  // Por ahora, simulamos y recargamos:
  console.warn("Simulando cancelación de reserva (ID:", booking.id, "). Implementar en BookingStore.");
  toast.add({ severity: "success", summary: "Éxito", detail: "Reserva cancelada (simulado)", life: 3000 });
  await loadData(); // Recarga
}

// Helpers (Puros, se quedan en la vista)
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
function translateBookingStatus(status) {
  return t(`bookingStatus.${status?.toLowerCase() || 'unknown'}`);
}
function canCancel(booking) {
  if (booking.status !== 'Confirmed') return false;
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  const hoursBefore = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursBefore > 24; // Permite cancelar 24h antes
}
function getRoomNumber(roomId) { return `ID ${roomId}`; }


// Logout (idéntico a v1)
function logout() {
  userStore.logout();
  localStorage.clear();
  router.push({ name: 'login' });
}

</script>

<style scoped>
/* (Estilos idénticos a v1) */
.text-primary {
  color: var(--primary-color);
}
.carousel-img {
  width: 100%;
  max-height: 12rem;
  height: auto;
  object-fit: contain;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: transform 0.2s ease-in-out;
}
:deep(.carousel-img) {
  width: 100%;
  height: 7rem;
  object-fit: cover;
  border-bottom: 1px solid #e5e7eb;
}
</style>