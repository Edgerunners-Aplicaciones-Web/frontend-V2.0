import { v4 as uuidv4 } from 'uuid';

/**
 * Entidad 'Review'. Es un "arma" secundaria que depende de 'Booking'.
 * No puede existir sin una reserva completada.
 */
export class Review {
    constructor({
                    id,
                    bookingId,
                    guestId,
                    rating,
                    comment,
                    createdAt
                }) {
        this.id = id || uuidv4();
        this.bookingId = bookingId;
        this.guestId = guestId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();

        if (this.rating < 1 || this.rating > 5) {
            throw new Error("El Rating debe estar entre 1 y 5.");
        }
        if (!this.comment || this.comment.trim() === '') {
            throw new Error("El Comentario no puede estar vacío.");
        }
    }
}