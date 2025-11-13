import { Review } from '../../domain/model/review.entity.js';

/**
 * "Ensamblador" (Traductor) para Reseñas.
 */
export const ReviewAssembler = {
    toEntity(dto) {
        if (!dto) return null;
        return new Review({
            id: dto.id,
            bookingId: dto.bookingId,
            guestId: dto.guestId,
            rating: dto.rating,
            comment: dto.comment,
            createdAt: dto.createdAt
        });
    },

    toRequest(entity) {
        return {
            id: entity.id,
            bookingId: entity.bookingId,
            guestId: entity.guestId,
            rating: entity.rating,
            comment: entity.comment,
            createdAt: entity.createdAt.toISOString()
        };
    }
};