// src/modules/analytics/infrastructure/repositories/analytics-repository.js

import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository.js';

// --- Dependencias de OTROS Bounded Contexts ---
// (¡El "Pase Químico" entre contextos!)
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApi.repository.js';
import { UserApiRepository } from '../../../iam/infrastructure/UserApi.repository.js';
import { ProfileApiRepository } from '../../../iam/infrastructure/ProfileApi.repository.js';
// Asumiremos que existe un BookingApiRepository del futuro Bounded Context 'Booking'
// import { BookingApiRepository } from '../../../booking/infrastructure/repositories/BookingApi.repository.js';

// --- Repositorio Falso de Booking (Temporal) ---
// (Borra esto cuando tengas el Bounded Context 'Booking' real)
class FakeBookingApiRepository {
    async getAllBookings() {
        console.warn("Analytics.repository: Usando FakeBookingApiRepository.getAllBookings");
        return [];
    }
    async getMyBookings(guestId) {
        console.warn("Analytics.repository: Usando FakeBookingApiRepository.getMyBookings");
        return [];
    }
}
// --- Fin del Falso ---


export class AnalyticsApiRepository extends IAnalyticsRepository {

    constructor() {
        super();
        // Instanciamos los "agentes" de los otros equipos
        this.propertyRepo = new PropertyApiRepository();
        this.userRepo = new UserApiRepository();
        this.profileRepo = new ProfileApiRepository();

        // USA EL REPOSITORIO FALSO POR AHORA
        this.bookingRepo = new FakeBookingApiRepository();
        // CUANDO ESTÉ LISTO, CÁMBIALO POR:
        // this.bookingRepo = new BookingApiRepository();
    }

    /**
     * Implementación de la Metavisión del Admin.
     * (Lógica movida desde AdminDashboard.vue v1)
     */
    async getAdminStats() {
        try {
            const [roomsData, profilesData, bookingsData] = await Promise.all([
                this.propertyRepo.getRooms(),
                this.profileRepo.getAllProfiles(),
                this.bookingRepo.getAllBookings()
            ]);

            const stats = {
                rooms: 0,
                staff: 0,
                bookingsToday: 0,
                occupancyRate: 0
            };

            // 1. Total Rooms
            stats.rooms = roomsData.length;

            // 2. Total Staff (basado en perfiles que tienen un 'position')
            stats.staff = profilesData.filter(p => p.position).length;

            // 3. Reservas (Hoy)
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            stats.bookingsToday = bookingsData.filter(b => {
                const bookingDate = new Date(b.createdAt); // Asumiendo 'createdAt'
                return bookingDate >= todayStart;
            }).length;

            // 4. Tasa Ocupación
            if (stats.rooms > 0) {
                const occupiedRooms = roomsData.filter(r => r.isOccupied()).length;
                stats.occupancyRate = Math.round((occupiedRooms / stats.rooms) * 100);
            }

            return stats;

        } catch (error) {
            console.error("Analytics.repository: Error en getAdminStats:", error);
            throw new Error(`No se pudieron calcular las estadísticas del Admin: ${error.message}`);
        }
    }

    /**
     * Implementación de la Metavisión del Huésped.
     * (Lógica movida desde useGuestDashboard.js v1)
     */
    async getGuestStats(guestId) {
        if (!guestId) throw new Error("Guest ID es requerido para getGuestStats");

        try {
            // [TÁCTICA MODIFICADA]
            const [userBookings, allProperties, allRooms] = await Promise.all([
                this.bookingRepo.getMyBookings(guestId), // Solo las del Guest
                this.propertyRepo.getProperties(), // Todas las propiedades
                this.propertyRepo.getRooms() // Todas las habitaciones (para imágenes)
                // guestSvc.getActiveServices(guestId) // (Omitido por ahora)
            ]);

            const services = []; // (Temporal)

            // 1. Procesa las reservas (para "Upcoming Bookings")
            const upcomingBookings = (Array.isArray(userBookings) ? userBookings : [])
                .filter(b => new Date(b.checkOut) >= Date.now()) // Activas o futuras
                .map(b => {
                    const prop = allProperties.find(p => p.id === b.propertyId);
                    return { ...b, propertyName: prop ? prop.name : 'Propiedad Desconocida' };
                })
                .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

            // 2. Procesa las "Propiedades Recientes"
            const recentProperties = (Array.isArray(userBookings) ? userBookings : [])
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(booking => {
                    const prop = allProperties.find(p => p.id === booking.propertyId);
                    const room = allRooms.find(r => r.id === booking.roomId);
                    return {
                        id: booking.propertyId,
                        name: prop ? prop.name : 'Propiedad Desconocida',
                        location: prop ? prop.location : 'Ubicación Desconocida',
                        image_url: room ? room.image_url : null
                    };
                })
                .filter((prop, index, self) => index === self.findIndex((p) => p.id === prop.id))
                .slice(0, 3);

            // 3. Recomendaciones
            const bookedPropertyIds = new Set(userBookings.map(b => b.propertyId));
            const recommendations = allProperties
                .filter(p => !bookedPropertyIds.has(p.id))
                .slice(0, 4)
                .map(p => ({
                    title: p.name,
                    description: p.location,
                    propertyId: p.id
                }));

            // 4. Stats Simples
            const simpleStats = {
                upcoming: upcomingBookings.length,
                services: services.length,
            };

            return { upcomingBookings, recentProperties, recommendations, simpleStats, services };

        } catch (error) {
            console.error("Analytics.repository: Error en getGuestStats:", error);
            throw new Error(`No se pudieron cargar los datos del Huésped: ${error.message}`);
        }
    }

    /**
     * Implementación de la Metavisión del Staff.
     * (Lógica movida desde PropertyService.js v1)
     */
    async getStaffStats(staffId, period = 'week', t) {
        if (!staffId) return { kpi: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, chartData: {} };

        // Esta lógica depende 100% del 'Property' Bounded Context
        const tasks = await this.propertyRepo.getTasks(staffId);
        const completedTasks = tasks.filter(t => t.isCompleted() && t.completedAt);

        const kpi = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };

        // --- Lógica de KPI (Corregida) ---
        const today_clean = new Date();
        const todayStart_clean = new Date(today_clean.getFullYear(), today_clean.getMonth(), today_clean.getDate());
        // ... (resto de la lógica de fechas de v1) ...
        const week_clean = new Date();
        const dayOfWeek_clean = week_clean.getDay();
        const diff_clean = week_clean.getDate() - dayOfWeek_clean + (dayOfWeek_clean === 0 ? -6 : 1);
        const weekStart_clean = new Date(week_clean.getFullYear(), week_clean.getMonth(), diff_clean);
        const month_clean = new Date();
        const monthStart_clean = new Date(month_clean.getFullYear(), month_clean.getMonth(), 1);
        const year_clean = new Date();
        const yearStart_clean = new Date(year_clean.getFullYear(), 0, 1);

        for (const task of completedTasks) {
            const completedDate = new Date(task.completedAt);
            if (completedDate >= todayStart_clean) kpi.daily++;
            if (completedDate >= weekStart_clean) kpi.weekly++;
            if (completedDate >= monthStart_clean) kpi.monthly++;
            if (completedDate >= yearStart_clean) kpi.yearly++;
        }

        // --- Generación Dinámica de Gráfica (Lógica de v1) ---
        const chartData = { labels: [], datasets: [{ label: t('tasks.filterCompleted'), data: [], backgroundColor: '#1ABC9C', borderColor: '#1ABC9C' }] };
        const dataMap = new Map();

        // ... (Toda la lógica del switch/case de 'period' de tu v1 'PropertyService.js' va aquí) ...
        // (Omitido por brevedad, pero es un copy-paste directo de tu v1)
        switch (period) {
            case 'today':
                chartData.labels = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
                chartData.labels.forEach(l => dataMap.set(l, 0));
                completedTasks
                    .filter(t => new Date(t.completedAt) >= todayStart_clean)
                    .forEach(t => {
                        const hour = new Date(t.completedAt).getHours();
                        const bucket = Math.floor(hour / 3);
                        const label = chartData.labels[bucket];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;
            // ... (casos 'month', 'year', 'week' de v1)
            default: // 'week'
                const dayLabels = [t('tasks.day6'), t('tasks.day5'), t('tasks.day4'), t('tasks.day3'), t('tasks.day2'), t('tasks.day1'), t('tasks.filterToday')];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateString = d.toISOString().split('T')[0];
                    const label = dayLabels[6-i];
                    chartData.labels.push(label);
                    dataMap.set(dateString, 0);
                }
                completedTasks.forEach(t => {
                    const completedDateString = t.completedAt.toISOString().split('T')[0];
                    if (dataMap.has(completedDateString)) {
                        dataMap.set(completedDateString, dataMap.get(completedDateString) + 1);
                    }
                });
                chartData.data = chartData.labels.map((label, index) => {
                    const dateStringKey = [...dataMap.keys()][index];
                    return dataMap.get(dateStringKey);
                });
                break;
        }

        if (period !== 'week') {
            chartData.datasets[0].data = Array.from(dataMap.values());
        } else {
            chartData.datasets[0].data = chartData.data;
            delete chartData.data;
        }
        // --- Fin Lógica v1 ---

        return { kpi, chartData };
    }
}