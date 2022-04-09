const UserService = require("../service/UserService");
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/Api-Error')

class UserController {
    async signUp (req, res, next) {
        try {
           const errors = validationResult(req);
           if (!errors.isEmpty()) {
               return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
           }
           const {login, password} = req.body;
           const UserData = await UserService.signUp(login, password);
           res.cookie('refreshToken', UserData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
           return res.json(UserData);
        } catch (e) {
           next(e)
        }
    }

    async signIn (req, res, next) {
        try {
            const {login, password} = req.body; 
            const UserData = await UserService.signIn(login, password);
            res.cookie('refreshToken', UserData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(UserData);
        } catch (e) {
            next(e)
        }
    }

    async logOut (req, res) {
        try {
            const {refreshToken} = req.cookies;
            await UserService.logOut(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json('Вы вышли из аккаунта');
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res) {
        try {
            const users = await UserService.getAll();
            return res.json(users);
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res) {
        try {
            const user = await UserService.getOne(req.params.id);
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }
    
    async getMe(req, res) {
        try {
            const {refreshToken} = req.cookies;
            const me = await UserService.getMe(refreshToken);
            return res.json({'Ваш id: ': me.id, 'Ваш login: ': me.login, 'Ваш пароль: ': me.password})
        } catch (e) {
            next(e)
        }
    }

    async activate(req, res) {
        try {
            const activationLink = req.params.link;
            await UserService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies; 
            const UserData = await UserService.refresh(refreshToken);
            res.cookie('refreshToken', UserData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(UserData);
        } catch (e) {
            next(e)
        }
    }
    async delete(req, res) {
        try {
            const post = await UserService.delete(req.params.id)
            return res.json(post)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()