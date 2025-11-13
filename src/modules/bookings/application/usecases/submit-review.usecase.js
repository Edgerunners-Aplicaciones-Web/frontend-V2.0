import { Review } from '../../domain/model/review.entity.js';
import { IBookingRepository } from '../../domain/repositories/i-booking-repository.js';

/**
 * Caso de Uso: Enviar una Reseña.
 */
export class SubmitReviewUseCase {
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    async execute({ bookingId, guestId, rating, comment }) {
        // 1. "Metavisión": Validar
        const booking = await this.bookingRepository.getBookingById(bookingId);
        if (!booking) throw new Error("Reserva no encontrada.");
        if (booking.guestId !== guestId) throw new Error("No autorizado para esta reserva.");
        if (booking.status !== 'Completada') {
            throw new Error("Solo puedes dejar reseñas de reservas completadas.");
        }

        // (Opcional: Verificar si ya existe una reseña)

        // 2. Crear la "Arma" (Entidad)
        const reviewEntity = new Review({
            bookingId,
            guestId,
            rating,
            comment
        });

        // 3. "Disparar" (Persistir)
        return await this.bookingRepository.createReview(reviewEntity);
    }
}