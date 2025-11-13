import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos si es necesario

/**
 * Entidad 'Booking'. Esta es el "Arma" principal (Aggregate Root) del contexto.
 * Representa el contrato de una reserva en el tiempo.
 */
export class Booking {
    constructor({
                    id,
                    propertyId,
                    roomId,
                    guestId,
                    checkIn,
                    checkOut,
                    status,
                    totalPrice,
                    createdAt
                }) {
        this.id = id || uuidv4();
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.guestId = guestId;
        this.checkIn = new Date(checkIn);
        this.checkOut = new Date(checkOut);
        this.status = status;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();

        if (this.checkOut <= this.checkIn) {
            throw new Error("La fecha de Check-out debe ser posterior a la de Check-in.");
        }
    }

    /**
     * "Arma" de lógica de negocio:
     * Calcula la duración de la estadía.
     * @returns {number} Número de noches.
     */
    get durationInDays() {
        const diffTime = Math.abs(this.checkOut.getTime() - this.checkIn.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * "Arma" de lógica de negocio:
     * Cambia el estado de la reserva.
     * @param {string} newStatus - "Confirmada", "Cancelada", "Completada"
     */
    updateStatus(newStatus) {
        // Aquí podría ir lógica de validación de transiciones de estado
        this.status = newStatus;
    }
}