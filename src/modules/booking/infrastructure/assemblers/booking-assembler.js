import { Booking } from '../../domain/model/Booking.entity.js';

/**
 * "Ensamblador" (Traductor):
 * Convierte los DTOs de la API en nuestras "Armas" (Entidades)
 * y viceversa.
 */
export const BookingAssembler = {
    /**
     * @param {BookingResponse} dto
     * @returns {Booking}
     */
    toEntity(dto) {
        if (!dto) return null;
        return new Booking({
            id: dto.id,
            propertyId: dto.propertyId,
            roomId: dto.roomId,
            guestId: dto.guestId,
            checkIn: dto.checkIn,
            checkOut: dto.checkOut,
            status: dto.status,
            totalPrice: dto.totalPrice,
            createdAt: dto.createdAt
        });
    },

    /**
     * @param {Booking} entity
     * @returns {object} Un objeto JSON simple para la API (Request)
     */
    toRequest(entity) {
        return {
            id: entity.id,
            propertyId: entity.propertyId,
            roomId: entity.roomId,
            guestId: entity.guestId,
            checkIn: entity.checkIn.toISOString(),
            checkOut: entity.checkOut.toISOString(),
            status: entity.status,
            totalPrice: entity.totalPrice,
            createdAt: entity.createdAt.toISOString()
        };
    }
};