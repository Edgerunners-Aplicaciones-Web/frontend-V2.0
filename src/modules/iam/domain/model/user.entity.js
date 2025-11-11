// src/iam/domain/model/user.entity.js
export class User {
    constructor(id, email, password, role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    isRole(role) {
        return this.role === role;
    }

}