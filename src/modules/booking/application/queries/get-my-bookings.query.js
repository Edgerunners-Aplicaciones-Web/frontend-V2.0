import { IBookingRepository } from '../../domain/repositories/i-booking-repository.js';
import { IPropertyRepository } from '../../../property/domain/repositories/i-property-repository.js';

/**
 * Query (Consulta): Obtener las reservas de un huésped.
 * ¡Esta "jugada" requiere "pases" de dos equipos (Booking y Property)!
 */
export class GetMyBookingsQuery {
    /**
     * @param {IBookingRepository} bookingRepository
     * @param {IPropertyRepository} propertyRepository (¡Inyección Inter-Contexto!)
     */
    constructor(bookingRepository, propertyRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
    }

    /**
     * @param {string} guestId
     * @returns {Promise<Array<object>>} Una lista enriquecida, no entidades puras.
     */
    async execute(guestId) {
        if (!guestId) throw new Error("Guest ID es requerido.");

        // 1. "Pase" de ambos equipos
        const [bookings, properties, rooms] = await Promise.all([
            this.bookingRepository.getBookingsByGuestId(guestId),
            this.propertyRepository.getAllProperties(),
            this.propertyRepository.getRooms(null)
        ]);

        if (!bookings.length) return [];

        // 2. "Química" (Enriquecer los datos para la UI)
        return bookings.map(booking => {
            const property = properties.find(p => p.id === booking.propertyId);
            const room = rooms.find(r => r.id === booking.roomId);

            return {
                id: booking.id,
                checkIn: booking.checkIn.toLocaleDateString(),
                checkOut: booking.checkOut.toLocaleDateString(),
                status: booking.status,
                totalPrice: booking.totalPrice,
                propertyName: property?.name || 'Propiedad Desconocida',
                propertyLocation: property?.location || '',
                roomNumber: room?.number || '??',
                roomType: room?.type || 'Habitación',
                roomImage: room?.image_url || property?.image_url || null
            };
        });
    }
}