// src/modules/iam/infrastructure/profile-response.js

export class ProfileResponse {
    constructor(id, user_id, full_name, position, shift_start, shift_end, current_status) {
        this.id = id;
        this.user_id = user_id;
        this.full_name = full_name;
        this.position = position;
        this.shift_start = shift_start;
        this.shift_end = shift_end;
        this.current_status = current_status;
    }
}