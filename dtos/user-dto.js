module.exports = class UserDto {
    login;
    id;
    isActivated;

    constructor(model) {
        this.login = model.login
        this.id = model._id
        this.isActivated = model.isActivated
    }
}