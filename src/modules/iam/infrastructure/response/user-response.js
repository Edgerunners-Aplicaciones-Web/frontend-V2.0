// src/modules/iam/infrastructure/user-response.js

export class UserResponse {
    constructor(id, email, password, role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}