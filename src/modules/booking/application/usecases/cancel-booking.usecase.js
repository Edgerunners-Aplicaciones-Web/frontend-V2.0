import { IBookingRepository } from '../../domain/repositories/i-booking-repository.js';
import { IPropertyRepository } from '../../../property/domain/repositories/i-property-repository.js';
import { BookingPolicyService } from '../../domain/services/booking-policy.service.js';

/**
 * Caso de Uso: Cancelar una Reserva.
 */
export class CancelBookingUseCase {
    constructor(bookingRepository, propertyRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
    }

    async execute(bookingId, guestId) {
        // 1. "Metavisión": Validar
        const booking = await this.bookingRepository.getBookingById(bookingId);
        if (!booking) throw new Error("Reserva no encontrada.");
        if (booking.guestId !== guestId) throw new Error("No autorizado para cancelar esta reserva.");

        // 2. "Regla del Juego": Usar el Servicio de Dominio (Política)
        if (!BookingPolicyService.canCancel(booking)) {
            throw new Error("La reserva ya no puede ser cancelada (fuera de política).");
        }

        // 3. "Disparar" (Actualizar Estado)
        // (En v1 usabas delete, aquí es mejor actualizar el estado)
        const cancelledBooking = await this.bookingRepository.updateBooking(bookingId, {
            status: 'Cancelada'
        });

        // 4. "Acción Secundaria": Liberar la habitación
        await this.propertyRepository.updateRoom(booking.roomId, { status: 'available' });

        return cancelledBooking;
    }
}