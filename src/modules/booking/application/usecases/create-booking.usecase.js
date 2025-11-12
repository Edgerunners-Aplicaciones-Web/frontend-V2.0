import { Booking } from '../../domain/model/booking.entity.js';
import { IBookingRepository } from '../../domain/repositories/i-booking-repository.js';
import { IPropertyRepository } from '../../../property/domain/repositories/i-property-repository.js';

/**
 * Caso de Uso: Crear una Reserva.
 * Orquesta la "jugada" de principio a fin.
 */
export class CreateBookingUseCase {
    /**
     * @param {IBookingRepository} bookingRepository
     * @param {IPropertyRepository} propertyRepository (para verificar disponibilidad)
     */
    constructor(bookingRepository, propertyRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
    }

    async execute({ propertyId, roomId, guestId, checkInDate, checkOutDate, totalPrice }) {

        // 1. "Metavisión": Validar que la habitación existe y está disponible
        const room = await this.propertyRepository.getRoomById(roomId);
        if (!room) throw new Error("La habitación no existe.");
        if (room.status !== 'available') {
            throw new Error(`La habitación #${room.number} no está disponible.`);
        }

        // 2. Crear la "Arma" (Entidad)
        const bookingEntity = new Booking({
            propertyId,
            roomId,
            guestId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice,
            status: 'Confirmada' // La política de negocio es confirmar al instante
        });

        // 3. "Disparar" (Persistir)
        const createdBooking = await this.bookingRepository.createBooking(bookingEntity);

        // 4. "Acción Secundaria": Marcar la habitación como 'Ocupada'
        await this.propertyRepository.updateRoom(roomId, { status: 'occupied' });

        return createdBooking;
    }
}