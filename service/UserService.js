const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./MailService')
const tokenService = require('./TokenService')
const UserDto = require('../dtos/user-dto');
const UserModel = require("../models/User-model");
const ApiError = require('../exceptions/Api-Error')

class UserService {
    async signUp (login, password) {
        const candidate = await UserModel.findOne({login})
        if (candidate) {
            throw ApiError.BadRequest('Пользователь уже существует')
        } else {
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()

        const createdUser = await UserModel.create({login, password: hashPassword, activationLink});
        await mailService.sendActivationMail(login, `${process.env.API_URL}/activate/${activationLink}`)

        const userDto = new UserDto(createdUser)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return {...tokens, user: userDto}
        }
    }

    async signIn (login, password) {
        const user = await UserModel.findOne({login})
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден')
        }
        const isPass = await bcrypt.compare(password, user.password);
        if (!isPass) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return {...tokens, user: userDto}
    }

    async logOut (refreshToken) {
        await tokenService.deleteToken(refreshToken);
    }

    async getAll() {
        const users = await UserModel.find();
        return users;
    }

    async getOne(id) {
        if (!id) {
            throw new Error('Id не указан')
        }
        const user = await UserModel.findById(id);
        return user
    }

    async getMe(refreshToken) {

        const UserData = tokenService.validateRefreshToken(refreshToken)
        const user = await UserModel.findById(UserData.id)
        return user
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if(!user) {
            throw ApiError.BadRequest('Неккоректная ссылка')
        }
        user.isActivated = true;
        await user.save();
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const UserData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!UserData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(UserData.id)
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        return {...tokens, user: userDto}
    }
    
    async delete(id) {
        if (!id) {
            throw new Error('Id не указан')
        }
        const user = await UserModel.findByIdAndDelete(id)
        return user;
    }
}

module.exports = new UserService();