import { defineStore } from 'pinia';
import { ref } from 'vue';

// --- Importar Casos de Uso y Consultas ---
import { CreateBookingUseCase } from '../usecases/create-booking.usecase.js';
import { CancelBookingUseCase } from '../usecases/cancel-booking.usecase.js';
import { SubmitReviewUseCase } from '../usecases/submit-review.usecase.js';
import { GetMyBookingsQuery } from '../queries/get-my-bookings.query.js';

// --- Importar Repositorios para Inyección ---
import { BookingApiRepository } from '../../infrastructure/repositories/booking-api-repository.js';
import { PropertyApiRepository } from '../../../properties/infrastructure/repositories/property-api.repository.js';

// --- Inyección de Dependencias (El "Coach" armando el equipo) ---
const bookingRepository = new BookingApiRepository();
const propertyRepository = new PropertyApiRepository(); // Dependencia externa

const createBookingUseCase = new CreateBookingUseCase(bookingRepository, propertyRepository);
const cancelBookingUseCase = new CancelBookingUseCase(bookingRepository, propertyRepository);
const submitReviewUseCase = new SubmitReviewUseCase(bookingRepository);
const getMyBookingsQuery = new GetMyBookingsQuery(bookingRepository, propertyRepository);
// --- Fin Inyección ---

/**
 * El "Cerebro" (Ego) del Bounded Context de Booking.
 * Orquesta todas las "jugadas" para la UI.
 */
export const useBookingStore = defineStore('bookings', () => {
    // --- State ---
    const myBookings = ref([]);
    const completedBookings = ref([]); // Para el formulario de reseñas
    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    /**
     * "Jugada": Cargar todas las reservas del huésped.
     */
    async function fetchMyBookings(guestId) {
        loading.value = true;
        error.value = null;
        try {
            const bookings = await getMyBookingsQuery.execute(guestId);
            myBookings.value = bookings;

            // Lógica de v1 'loadCompletedBookings'
            completedBookings.value = bookings
                .filter(b => b.status === 'Completada')
                .map(b => ({
                    id: b.id,
                    label: `Reserva en ${b.propertyName} (Hab. ${b.roomNumber})`
                }));

        } catch (e) {
            error.value = e.message;
            myBookings.value = [];
            completedBookings.value = [];
        } finally {
            loading.value = false;
        }
    }

    /**
     * "Jugada": Ejecutar la "Fórmula de Gol" (Crear Reserva).
     */
    async function createBooking(bookingDetails) {
        loading.value = true;
        error.value = null;
        try {
            await createBookingUseCase.execute(bookingDetails);
            // (La redirección se maneja en la vista)
        } catch (e) {
            error.value = e.message;
            throw e; // Re-lanzar para que la vista lo atrape
        } finally {
            loading.value = false;
        }
    }

    /**
     * "Jugada": Cancelar una reserva.
     */
    async function cancelBooking(bookingId, guestId) {
        loading.value = true;
        error.value = null;
        try {
            await cancelBookingUseCase.execute(bookingId, guestId);
            // Recargar la lista después de cancelar
            await fetchMyBookings(guestId);
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * "Jugada": Enviar una reseña.
     */
    async function submitReview(reviewDetails) {
        loading.value = true;
        error.value = null;
        try {
            await submitReviewUseCase.execute(reviewDetails);
            // Recargar las reservas (para que ya no aparezca en "pendientes de reseña")
            await fetchMyBookings(reviewDetails.guestId);
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    return {
        myBookings,
        completedBookings,
        loading,
        error,
        fetchMyBookings,
        createBooking,
        cancelBooking,
        submitReview
    };
});