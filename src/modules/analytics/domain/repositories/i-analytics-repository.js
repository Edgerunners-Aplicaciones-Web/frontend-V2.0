// src/modules/analytics/domain/repositories/i-analytics-repository.js

export class IAnalyticsRepository {
    /**
     * Obtiene las estadísticas clave para el Admin.
     * @returns {Promise<object>} ej: { rooms: 0, staff: 0, bookingsToday: 0, occupancyRate: 0 }
     */
    getAdminStats() {
        throw new Error("Not implemented: getAdminStats");
    }

    /**
     * Obtiene los datos del panel para un Huésped (Guest).
     * @param {string} guestId - El ID del usuario Huésped.
     * @returns {Promise<object>} ej: { upcomingBookings: [], recentProperties: [], recommendations: [] }
     */
    getGuestStats(guestId) {
        throw new Error("Not implemented: getGuestStats");
    }

    /**
     * Obtiene las estadísticas de rendimiento para un Staff.
     * @param {string} staffId - El ID del usuario Staff.
     * @param {string} period - 'today', 'week', 'month', 'year'
     * @param {function} t - La función de internacionalización (i18n) para las etiquetas.
     * @returns {Promise<object>} ej: { kpi: { daily: 0, ... }, chartData: { ... } }
     */
    getStaffStats(staffId, period, t) {
        throw new Error("Not implemented: getStaffStats");
    }
}