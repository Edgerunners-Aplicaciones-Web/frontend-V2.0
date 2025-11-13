import { IBookingRepository } from '../../domain/repositories/i-booking-repository.js';
import { bookingApi } from '../api/booking-api.js';
import { BookingAssembler } from '../assemblers/booking-assembler.js';
import { ReviewAssembler } from '../assemblers/review-assembler.js';

/**
 * Implementación del "Contrato" IBookingRepository.
 * Utiliza el "Agente" (Api) y los "Traductores" (Assemblers).
 */
export class BookingApiRepository extends IBookingRepository {

    async createBooking(bookingEntity) {
        const requestData = BookingAssembler.toRequest(bookingEntity);
        const responseDto = await bookingApi.postBooking(requestData);
        return BookingAssembler.toEntity(responseDto);
    }

    async updateBooking(bookingId, bookingData) {
        // Asume que bookingData es un objeto simple, ej: { status: 'Cancelada' }
        const responseDto = await bookingApi.patchBooking(bookingId, bookingData);
        return BookingAssembler.toEntity(responseDto);
    }

    async deleteBooking(bookingId) {
        await bookingApi.removeBooking(bookingId);
    }

    async getBookingById(bookingId) {
        const responseDto = await bookingApi.fetchBookingById(bookingId);
        return BookingAssembler.toEntity(responseDto);
    }

    async getBookingsByGuestId(guestId) {
        const responseDtos = await bookingApi.fetchBookingsByGuestId(guestId);
        return responseDtos.map(BookingAssembler.toEntity);
    }

    async getAllBookings() {
        const responseDtos = await bookingApi.fetchAllBookings();
        return responseDtos.map(BookingAssembler.toEntity);
    }

    async createReview(reviewEntity) {
        const requestData = ReviewAssembler.toRequest(reviewEntity);
        const responseDto = await bookingApi.postReview(requestData);
        return ReviewAssembler.toEntity(responseDto);
    }

    async getReviewsByBookingId(bookingId) {
        const responseDtos = await bookingApi.fetchReviewsByBookingId(bookingId);
        return responseDtos.map(ReviewAssembler.toEntity);
    }
}