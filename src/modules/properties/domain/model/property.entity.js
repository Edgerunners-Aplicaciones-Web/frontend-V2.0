//src/modules/properties/domain/model/properties.entity.js

export class Property {
    constructor({
                    id,
                    hostId,
                    name,
                    location,
                    image_url,
                    description,
                    base_price,
                    type,
                    amenities = []
                }) {
        this.id = id;
        this.hostId = hostId;
        this.name = name;
        this.location = location;
        this.image_url = image_url;
        this.description = description;
        this.base_price = base_price;
        this.type = type;
        this.amenities = amenities;
    }

    // "Arma" de lógica de negocio:
    hasAmenity(amenityName) {
        return this.amenities.includes(amenityName.toLowerCase());
    }

    // "Arma" de utilidad:
    getShortDescription() {
        if (!this.description) return "Sin descripción.";
        return this.description.length > 100
            ? this.description.substring(0, 100) + '...'
            : this.description;
    }
}