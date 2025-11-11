// El Cerebro (Pinia Store) del Bounded Context 'Analytics'
import { defineStore } from 'pinia';
import { ref } from 'vue';

// --- Importar Repositorio y Queries ---
import { AnalyticsApiRepository } from '../../infrastructure/repositories/analytics-repository.js';
import { GetAdminStatsQuery } from '../get-admin-stats.query.js';
import { GetGuestStatsQuery } from '../get-guest-stats.query.js';
import { GetStaffStatsQuery } from '../get-staff-stats.query.js';

// --- Inyección de Dependencias Manual ---
const analyticsRepository = new AnalyticsApiRepository();
const getAdminStatsQuery = new GetAdminStatsQuery(analyticsRepository);
const getGuestStatsQuery = new GetGuestStatsQuery(analyticsRepository);
const getStaffStatsQuery = new GetStaffStatsQuery(analyticsRepository);
// --- Fin Inyección ---

export const useAnalyticsStore = defineStore('analytics', () => {
    // --- State ---
    const adminStats = ref({ rooms: 0, staff: 0, bookingsToday: 0, occupancyRate: 0 });
    const guestStats = ref({ upcomingBookings: [], recentProperties: [], recommendations: [], simpleStats: { upcoming: 0, services: 0 }, services: [] });
    const staffStats = ref({ kpi: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, chartData: {} });

    const loading = ref(false);
    const error = ref(null);

    // --- Actions ---

    async function fetchAdminStats() {
        loading.value = true;
        error.value = null;
        try {
            adminStats.value = await getAdminStatsQuery.execute();
        } catch (e) {
            error.value = e.message;
            console.error("Analytics.store: Error fetchAdminStats:", e);
        } finally {
            loading.value = false;
        }
    }

    async function fetchGuestStats(guestId) {
        loading.value = true;
        error.value = null;
        try {
            guestStats.value = await getGuestStatsQuery.execute(guestId);
        } catch (e) {
            error.value = e.message;
            console.error("Analytics.store: Error fetchGuestStats:", e);
        } finally {
            loading.value = false;
        }
    }

    async function fetchStaffStats(staffId, period, t) {
        loading.value = true;
        error.value = null;
        try {
            staffStats.value = await getStaffStatsQuery.execute(staffId, period, t);
        } catch (e) {
            error.value = e.message;
            console.error("Analytics.store: Error fetchStaffStats:", e);
        } finally {
            loading.value = false;
        }
    }

    return {
        // State
        adminStats,
        guestStats,
        staffStats,
        loading,
        error,
        // Actions
        fetchAdminStats,
        fetchGuestStats,
        fetchStaffStats
    };
});