<template>
  <div class="p-6 max-w-2xl mx-auto">
    <pv-toast />
    <pv-button
        icon="pi pi-arrow-left"
        label="Volver a Reservas"
        class="p-button-text p-button-sm mb-4"
        @click="goBack"
    />

    <pv-card class="shadow-md">
      <template #title>
        <h3 class="text-2xl font-bold text-primary">Dejar una Reseña</h3>
      </template>
      <template #content>
        <div class="field">
          <label for="bookingSelect" class="font-semibold">Reserva a reseñar</label>
          <pv-select id="bookingSelect"
                     v-model="selectedBookingId"
                     :options="store.completedBookings"
                     optionLabel="label"
                     optionValue="id"
                     placeholder="Selecciona una reserva completada"
                     class="w-full mt-2"
                     :disabled="store.loading"
          />
        </div>
        <div class="field mt-4">
          <label for="rating" class="font-semibold">Puntuación</label>
          <div>
            <pv-rating id="rating" v-model="rating" :cancel="false" class="mt-2" :stars="5" />
          </div>
        </div>
        <div class="field mt-4">
          <label for="reviewText" class="font-semibold">Comentario</label>
          <pv-textarea id="reviewText" v-model="reviewText" placeholder="Escribe tu reseña..." rows="5" class="w-full mt-2" />
        </div>
      </template>
      <template #footer>
        <pv-button
            label="Enviar Reseña"
            icon="pi pi-send"
            @click="submit"
            :loading="store.loading"
            :disabled="!selectedBookingId || !rating || !reviewText"
        />
      </template>
    </pv-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

// --- Importar componentes PrimeVue ---
import PvCard from 'primevue/card';
import PvButton from 'primevue/button';
import PvSelect from 'primevue/select';
import PvRating from 'primevue/rating';
import PvTextarea from 'primevue/textarea';
import PvToast from 'primevue/toast';

// --- Importar el STORE ---
import { useBookingStore } from '../../application/store/Booking.store.js';

// --- Inicializar "Armas" ---
const router = useRouter();
const route = useRoute(); // Para leer el query param
const toast = useToast();
const store = useBookingStore();
const { t } = useI18n();

// --- Estado Local de la Vista ---
const reviewText = ref("");
const rating = ref(null);
const selectedBookingId = ref(null);
const guestId = ref(null);
// const completedBookings = ref([]); // <-- Ahora vive en el store

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    guestId.value = JSON.parse(storedUser).id;
    // Llama al store para cargar las reservas
    await store.fetchMyBookings(guestId.value);

    // "Táctica": Pre-seleccionar la reserva si viene en la URL
    const queryBookingId = route.query.bookingId;
    if (queryBookingId && store.completedBookings.some(b => b.id == queryBookingId)) {
      selectedBookingId.value = parseInt(queryBookingId);
    }

  } else {
    console.error("GuestReviewForm: No user found!");
    toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario no encontrado.', life: 3000 });
  }
});

async function submit() {
  if (!guestId.value || !selectedBookingId.value || !reviewText.value || !rating.value) {
    toast.add({ severity: 'warn', summary: 'Datos incompletos', detail: 'Por favor, completa todos los campos.', life: 3000 });
    return;
  }

  console.log(`GuestReviewForm: Submitting review for booking ${selectedBookingId.value}`);
  try {
    await store.submitReview({
      bookingId: selectedBookingId.value,
      guestId: guestId.value,
      reviewText: reviewText.value,
      rating: rating.value
    });

    toast.add({ severity: 'success', summary: '¡Gracias!', detail: 'Reseña enviada con éxito.', life: 3000 });

    // Limpiar formulario y volver
    reviewText.value = "";
    rating.value = null;
    selectedBookingId.value = null;
    router.push({ name: 'guest-my-bookings' });

  } catch (error) {
    console.error("Error submitting review (View):", error);
    toast.add({ severity: 'error', summary: 'Error', detail: store.error || 'No se pudo enviar la reseña.', life: 4000 });
  }
}

function goBack() {
  router.push({ name: 'guest-my-bookings' });
}
</script>

<style scoped>
.text-primary { color: var(--primary-color); }
.p-6 { padding: 1.5rem; }
.max-w-2xl { max-width: 42rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-4 { margin-bottom: 1rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.w-full { width: 100%; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
</style>