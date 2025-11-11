// src/modules/analytics/application/get-admin-stats.query.js

import { IAnalyticsRepository } from '../domain/repositories/i-analytics-repository.js';

export class GetAdminStatsQuery {
    /**
     * @param {IAnalyticsRepository} analyticsRepository
     */
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    async execute() {
        return await this.analyticsRepository.getAdminStats();
    }
}