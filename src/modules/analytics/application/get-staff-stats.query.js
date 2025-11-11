// src/modules/analytics/application/get-staff-stats.query.js

import { IAnalyticsRepository } from '../domain/repositories/i-analytics-repository.js';

export class GetStaffStatsQuery {
    /**
     * @param {IAnalyticsRepository} analyticsRepository
     */
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    async execute(staffId, period, t) {
        return await this.analyticsRepository.getStaffStats(staffId, period, t);
    }
}