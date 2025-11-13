// src/iam/domain/model/profile.entity.js

export class Profile {
    constructor(id, userId, fullName, position, shiftStart, shiftEnd, currentStatus) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.position = position;
        this.shiftStart = shiftStart;
        this.shiftEnd = shiftEnd;
        this.currentStatus = currentStatus;
    }

    getDisplayName() {
        return this.fullName || 'Usuario';
    }

    isOnShift() {
        if (!this.shiftStart || !this.shiftEnd) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const [startH, startM] = this.shiftStart.split(':').map(Number);
        const [endH, endM] = this.shiftEnd.split(':').map(Number);

        const startTimeMinutes = startH * 60 + startM;
        const endTimeMinutes = endH * 60 + endM;
        const currentTimeMinutes = currentHour * 60 + currentMinute;

        return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
    }
}