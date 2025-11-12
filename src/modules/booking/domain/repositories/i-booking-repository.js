/**
 * @interface IBookingRepository
 * @description Interfaz (el "contrato") para la persistencia de 'Booking' y 'Review'.
 * Define las "reglas del juego" para la base de datos.
 */
export class IBookingRepository {
    // --- Booking Methods ---
    createBooking(bookingEntity) { throw new Error("Not implemented: createBooking"); }
    updateBooking(bookingId, bookingData) { throw new Error("Not implemented: updateBooking"); }
    deleteBooking(bookingId) { throw new Error("Not implemented: deleteBooking"); }
    getBookingById(bookingId) { throw new Error("Not implemented: getBookingById"); }
    getBookingsByGuestId(guestId) { throw new Error("Not implemented: getBookingsByGuestId"); }
    getAllBookings() { throw new Error("Not implemented: getAllBookings"); }

    // --- Review Methods ---
    createReview(reviewEntity) { throw new Error("Not implemented: createReview"); }
    getReviewsByBookingId(bookingId) { throw new Error("Not implemented: getReviewsByBookingId"); }
}