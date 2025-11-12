/**
 * Servicio de Dominio. Contiene "reglas de juego" puras que no
 * pertenecen a una sola entidad (ej. políticas de cancelación).
 */
export class BookingPolicyService {
    /**
     * "Arma" de lógica pura:
     * Verifica si una reserva CUMPLE la política para ser cancelada.
     * @param {Booking} booking - La entidad de la reserva.
     * @param {Date} cancellationDate - La fecha/hora actual.
     * @returns {boolean}
     */
    static canCancel(booking, cancellationDate = new Date()) {
        if (booking.status !== 'Confirmada' && booking.status !== 'Pendiente') {
            return false;
        }

        // Política: Solo se puede cancelar 24 horas ANTES del check-in.
        const hoursBeforeCheckIn = (booking.checkIn.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60);

        return hoursBeforeCheckIn > 24;
    }
}