const ApiError = require('../exceptions/Api-Error')
const tokenService = require('../service/TokenService')
module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }
        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) {
            next(ApiError.UnauthorizedError())
        }

        const UserData = tokenService.validateAccessToken(accessToken)
        if (!UserData) {
            return next(ApiError.UnauthorizedError())
        }
        req.user = UserData;
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}