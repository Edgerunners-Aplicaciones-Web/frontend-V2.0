// src/modules/analytics/infrastructure/repositories/analytics-repository.js

import { IAnalyticsRepository } from '../../domain/repositories/i-analytics-repository.js';

// --- Dependencias de OTROS Bounded Contexts ---
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/property-api.repository.js';
import { UserApiRepository } from '../../../iam/infrastructure/repositories/user-api.repository.js';
import { ProfileApiRepository } from '../../../profile/infrastructure/repositories/profile-api.repository.js';

import { OperationsApiRepository } from '../../../operations/infrastructure/repositories/operations-api.repository.js';
import { BookingApiRepository } from '../../../booking/infrastructure/repositories/booking-api-repository.js';


export class AnalyticsApiRepository extends IAnalyticsRepository {

    constructor() {
        super();
        // Instanciamos los "agentes" de los otros equipos
        this.propertyRepo = new PropertyApiRepository();
        this.userRepo = new UserApiRepository();
        this.profileRepo = new ProfileApiRepository();

        // ¡"Fichajes" CORREGIDOS!
        this.bookingRepo = new BookingApiRepository();
        this.operationsRepo = new OperationsApiRepository(); // ¡Nuevo "fichaje"!
    }

    /**
     * Implementación de la Metavisión del Admin.
     */
    async getAdminStats() {
        try {
            // ¡"Pases" a los equipos correctos!
            const [roomsData, profilesData, bookingsData] = await Promise.all([
                this.propertyRepo.getRooms(), // Correcto
                this.profileRepo.getAllProfiles(), // Correcto
                this.bookingRepo.getAllBookings() // Correcto
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
                const bookingDate = new Date(b.createdAt);
                return bookingDate >= todayStart;
            }).length;

            // 4. Tasa Ocupación
            if (stats.rooms > 0) {
                // ¡"Falla de Química" CORREGIDA!
                // La API de /rooms devuelve JSON, no entidades.
                // ¡La entidad Room.js tiene el método isOccupied(), pero el JSON no!
                // Debemos usar la lógica de v1 'PropertyService' aquí:
                const occupiedRooms = roomsData.filter(r => r.status === 'occupied').length; // ¡Lógica de v1!
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
     */
    async getGuestStats(guestId) {
        if (!guestId) throw new Error("Guest ID es requerido para getGuestStats");

        try {
            const [userBookings, allProperties, allRooms] = await Promise.all([
                this.bookingRepo.getBookingsByGuestId(guestId), // Correcto
                this.propertyRepo.getProperties(), // Correcto
                this.propertyRepo.getRooms() // Correcto
            ]);

            const services = []; // (Temporal)

            // 1. Procesa "Upcoming Bookings" (Lógica de v1)
            const upcomingBookings = (Array.isArray(userBookings) ? userBookings : [])
                .filter(b => new Date(b.checkOut) >= Date.now())
                .map(b => {
                    const prop = allProperties.find(p => p.id === b.propertyId);
                    // ¡"Pase Químico" entre Booking y Property!
                    return { ...b, propertyName: prop ? prop.name : 'Propiedad Desconocida' };
                })
                .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

            // 2. Procesa "Propiedades Recientes" (Lógica de v1)
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

            // 3. Recomendaciones (Lógica de v1)
            const bookedPropertyIds = new Set(userBookings.map(b => b.propertyId));
            const recommendations = allProperties
                .filter(p => !bookedPropertyIds.has(p.id))
                .slice(0, 4)
                .map(p => ({
                    title: p.name,
                    description: p.location,
                    propertyId: p.id
                }));

            // 4. Stats Simples (Lógica de v1)
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
     */
    async getStaffStats(staffId, period = 'week', t) {
        if (!staffId) return { kpi: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, chartData: {} };

        // ¡"PASE" AL EQUIPO CORRECTO!
        // Ya no usamos 'propertyRepo.getTasks', usamos 'operationsRepo.getTasks'
        const tasks = await this.operationsRepo.getTasks(staffId);

        // ¡"Falla de Química" CORREGIDA!
        // El repo devuelve Entidades Task, que SÍ tienen el método .isCompleted()
        const completedTasks = tasks.filter(t => t.isCompleted() && t.completedAt);

        const kpi = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };

        // --- Lógica de KPI (Corregida) ---
        const today_clean = new Date();
        const todayStart_clean = new Date(today_clean.getFullYear(), today_clean.getMonth(), today_clean.getDate());
        const week_clean = new Date();
        const dayOfWeek_clean = week_clean.getDay();
        const diff_clean = week_clean.getDate() - dayOfWeek_clean + (dayOfWeek_clean === 0 ? -6 : 1);
        const weekStart_clean = new Date(week_clean.getFullYear(), week_clean.getMonth(), diff_clean);
        const month_clean = new Date();
        const monthStart_clean = new Date(month_clean.getFullYear(), month_clean.getMonth(), 1);
        const year_clean = new Date();
        const yearStart_clean = new Date(year_clean.getFullYear(), 0, 1);

        for (const task of completedTasks) {
            const completedDate = task.completedAt; // ¡Ya es un objeto Date!
            if (completedDate >= todayStart_clean) kpi.daily++;
            if (completedDate >= weekStart_clean) kpi.weekly++;
            if (completedDate >= monthStart_clean) kpi.monthly++;
            if (completedDate >= yearStart_clean) kpi.yearly++;
        }

        // --- Generación Dinámica de Gráfica (Lógica de v1) ---
        const chartData = { labels: [], datasets: [{ label: t('tasks.filterCompleted'), data: [], backgroundColor: '#1ABC9C', borderColor: '#1ABC9C' }] };
        const dataMap = new Map();

        switch (period) {
            case 'today':
                chartData.labels = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
                chartData.labels.forEach(l => dataMap.set(l, 0));
                completedTasks
                    .filter(t => t.completedAt >= todayStart_clean)
                    .forEach(t => {
                        const hour = t.completedAt.getHours(); // ¡Ya es Date!
                        const bucket = Math.floor(hour / 3);
                        const label = chartData.labels[bucket];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;
            case 'month':
                chartData.labels = [t('tasks.week') + ' 1', t('tasks.week') + ' 2', t('tasks.week') + ' 3', t('tasks.week') + ' 4+'];
                chartData.labels.forEach(l => dataMap.set(l, 0));
                completedTasks
                    .filter(t => t.completedAt >= monthStart_clean)
                    .forEach(t => {
                        const dayOfMonth = t.completedAt.getDate(); // ¡Ya es Date!
                        let label;
                        if (dayOfMonth <= 7) label = chartData.labels[0];
                        else if (dayOfMonth <= 14) label = chartData.labels[1];
                        else if (dayOfMonth <= 21) label = chartData.labels[2];
                        else label = chartData.labels[3];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;
            case 'year':
                chartData.labels = [t('tasks.monthJan'), t('tasks.monthFeb'), t('tasks.monthMar'), t('tasks.monthApr'), t('tasks.monthMay'), t('tasks.monthJun'), t('tasks.monthJul'), t('tasks.monthAug'), t('tasks.monthSep'), t('tasks.monthOct'), t('tasks.monthNov'), t('tasks.monthDec')];
                chartData.labels.forEach(l => dataMap.set(l, 0));
                completedTasks
                    .filter(t => t.completedAt >= yearStart_clean)
                    .forEach(t => {
                        const month = t.completedAt.getMonth(); // ¡Ya es Date!
                        const label = chartData.labels[month];
                        dataMap.set(label, dataMap.get(label) + 1);
                    });
                break;
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