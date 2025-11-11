// src/modules/analytics/application/get-guest-stats.query.js

import { IAnalyticsRepository } from '../domain/repositories/i-analytics-repository.js';

export class GetGuestStatsQuery {
    /**
     * @param {IAnalyticsRepository} analyticsRepository
     */
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    async execute(guestId) {
        return await this.analyticsRepository.getGuestStats(guestId);
    }
}