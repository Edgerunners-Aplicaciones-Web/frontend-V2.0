<template>
  <div class="p-6 max-w-6xl mx-auto">
    <pv-toast />
    <pv-confirm-dialog />

    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="p-button-outlined p-button-sm"
            @click="goBack"
        />
        <h3 class="text-3xl font-bold text-primary">Mis Reservas</h3>
      </div>

      <language-switcher />
    </div>

    <!-- USA EL STORE -->
    <div v-if="store.loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem"></i>
      <p class="text-gray-500 mt-2">Buscando tus reservas...</p>
    </div>

    <pv-data-table
        v-else-if="store.myBookings.length"
        :value="store.myBookings"
        responsive-layout="scroll"
        tableStyle="min-width: 50rem"
        class="shadow-sm rounded-lg overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-lg font-semibold text-primary">Listado de reservas</span>
          <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="loadBookings" />
        </div>
      </template>

      <!-- (Columnas idénticas a v1) -->
      <pv-column header="Imagen">
        <template #body="{ data }">
          <div class="reservation-image-container ...">
            <img
                v-if="data.roomImage"
                :src="data.roomImage"
                alt="Imagen de habitación"
                class="w-full h-full object-cover"
            />
            <i v-else class="pi pi-image text-gray-400 text-lg"></i>
          </div>
        </template>
      </pv-column>
      <pv-column header="Propiedad">
        <template #body="{ data }">
          <div>
            <p class="font-semibold text-gray-800">{{ data.propertyName }}</p>
            <p class="text-sm text-gray-500">
              Hab. #{{ data.roomNumber }} — {{ data.roomType }}
            </p>
            <p class="text-xs text-gray-400 flex items-center gap-1">
              <i class="pi pi-map-marker text-xs"></i>{{ data.propertyLocation }}
            </p>
          </div>
        </template>
      </pv-column>
      <pv-column header="Fechas">
        <template #body="{ data }">
          <div class="text-sm text-gray-700">
            <i class="pi pi-calendar text-xs mr-1"></i>
            <!-- formatDate ahora es local -->
            {{ formatDate(data.checkIn) }} → {{ formatDate(data.checkOut) }}
          </div>
        </template>
      </pv-column>
      <pv-column header="Estado">
        <template #body="{ data }">
          <!-- getStatusSeverity ahora es local -->
          <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
      </pv-column>
      <pv-column header="Acciones" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2 justify-end">
            <pv-button
                v-if="data.status === 'Confirmada' || data.status === 'Pendiente'"
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-sm"
                @click="confirmDelete(data.id)"
                :loading="loadingStates[data.id]"
                v-tooltip.bottom="'Eliminar reserva'"
            />
            <pv-button
                v-if="data.status === 'Completada'"
                icon="pi pi-star"
                class="p-button-rounded p-button-info p-button-sm"
                @click="goToReview(data.id)"
                v-tooltip.bottom="'Dejar reseña'"
            />
          </div>
        </template>
      </pv-column>

      <template #footer>
        <div class="text-sm text-gray-600 text-right">
          Total de reservas: {{ store.myBookings.length }}
        </div>
      </template>
    </pv-data-table>

    <p v-else class="text-center p-6 bg-gray-50 rounded-lg text-gray-600">
      <i class="pi pi-info-circle mr-2"></i> No tienes reservas activas.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import PvButton from "primevue/button";
import PvTag from "primevue/tag";
import PvToast from "primevue/toast";
import PvConfirmDialog from "primevue/confirmdialog";
import PvDataTable from "primevue/datatable";
import PvColumn from "primevue/column";
import Tooltip from 'primevue/tooltip';
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";

// --- Importar el STORE ---
import { useBookingStore } from "../../application/store/Booking.store.js";

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const store = useBookingStore();
const { t } = useI18n();

const loadingStates = ref({}); // Estado local para spinners de cancelación
const guestId = ref(null);
const vTooltip = Tooltip; // Registrar directiva

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    await loadBookings();
  } else {
    store.loading = false;
    toast.add({ severity: "error", summary: "Error", detail: "Usuario no encontrado.", life: 3000 });
  }
});

async function loadBookings() {
  if (!guestId.value) return;
  await store.fetchMyBookings(guestId.value);
  if (store.error) {
    toast.add({ severity: "error", summary: "Error", detail: store.error, life: 3000 });
  }
}

async function confirmDelete(bookingId) {
  confirm.require({
    message: t('myBookings.confirmDeleteMsg', { id: bookingId }), // Usar i18n
    header: t('myBookings.confirmDeleteHeader'),
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      loadingStates.value[bookingId] = true;
      try {
        await store.cancelBooking(bookingId, guestId.value); // Llama al Store
        toast.add({ severity: "success", summary: t('common.success'), detail: t('myBookings.deleteSuccess'), life: 2500 });
        // No es necesario recargar, el store lo hace
      } catch (error) {
        toast.add({ severity: "error", summary: t('common.error'), detail: store.error, life: 3000 });
      } finally {
        loadingStates.value[bookingId] = false;
      }
    },
  });
}

function goBack() {
  router.push({ name: "guest-dashboard" });
}

function goToReview(bookingId) {
  router.push({ name: "guest-review-form", query: { bookingId } });
}

// --- Helpers Locales ---
function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  // Asumimos que dateString ya es una fecha local (o ISO)
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusSeverity(status) {
  switch (status) {
    case "Confirmada": return "success";
    case "Pendiente": return "warning";
    case "Cancelada": return "danger";
    case "Completada": return "info";
    default: return "secondary";
  }
}
</script>

<style scoped>
.text-primary { color: var(--primary-color); }
.reservation-image-container {
  width: 8rem; /* 128px */
  height: 6rem; /* 96px */
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}
.reservation-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.reservation-image-container i {
  font-size: 1.5rem; /* 24px */
  color: #9ca3af;
}
/* Clases de utilidad */
.p-6 { padding: 1.5rem; }
.max-w-6xl { max-width: 72rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-6 { margin-bottom: 1.5rem; }
.gap-3 { gap: 0.75rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.p-8 { padding: 2rem; }
.text-gray-500 { color: #6b7280; }
.mt-2 { margin-top: 0.5rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.rounded-lg { border-radius: 0.5rem; }
.overflow-hidden { overflow: hidden; }
.text-lg { font-size: 1.125rem; }
.font-semibold { font-weight: 600; }
.gap-2 { gap: 0.5rem; }
.font-semibold { font-weight: 600; }
.text-gray-800 { color: #1f2937; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.gap-1 { gap: 0.25rem; }
.text-gray-400 { color: #9ca3af; }
.text-gray-700 { color: #374151; }
.justify-end { justify-content: flex-end; }
.text-gray-600 { color: #4b5563; }
.text-right { text-align: right; }
.p-6 { padding: 1.5rem; }
.bg-gray-50 { background-color: #f9fafb; }
</style>