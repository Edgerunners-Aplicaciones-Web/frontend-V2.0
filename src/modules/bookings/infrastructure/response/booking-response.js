/**
 * DTO (Data Transfer Object)
 * Representa la "forma" de los datos JSON que vienen de la API.
 */
export class BookingResponse {
    constructor({ id, propertyId, roomId, guestId, checkIn, checkOut, status, totalPrice, createdAt }) {
        this.id = id;
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.guestId = guestId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt;
    }
}