const Router = require('express').Router;
const UserController =  require('../controllers/UserController.js');
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware');
const { getAll } = require('../service/UserService.js');


const router = new Router()

/**
* @swagger
* components:
*   schemas:
*    User:
*        type: object
*        required:
*          - login
*          - password
*        properties:
*          id:
*            type: string
*          login:
*            type: string
*            unique: true
*          password:
*            type: string
*          isActivated:
*              type: Boolean
*              default: false
*          activationLink:
*              type: string
*        example:
*          id: 6250740d6b0f304b6aebf209
*          login: rockstar04112001@gmail.com
*          password: $2b$04$zNZaZ5t1RHUvuQE1qwHKG.zWj/H9Q6wp6ddbB7R8w6XVu837OToCq
*          isActivated: false
*          activationLink: a11a223e-06b1-49b0-9197-5d3c28e624ca
*    Token:
*        type: object
*        required:
*          - refreshToken
*        properties:
*          login:
*            type: Schema.Types.ObjectId
*            ref: 'User'
*          refreshToken:
*            type: string
*        example:
*          id: 6250740d6b0f304b6aebf209
*          refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InJvY2tzdGFyMDQxMTIwM...
*/

/**
* @swagger
* /signup:
*   post:
*     summary: registration of a new user
*     responses:
*       '200':
*          descriptions: registration of a new user
*          content: 
*            application/json:
*              schema:
*                type: object
*                properties:
*                  accessToken:
*                    type: string
*                  refreshToken:
*                    type: string
*                  user:
*                    type: object
*                    properties:
*                      login:
*                        type: string
*                        unique: true
*                      id:
*                        type: string
*                      isActivated:
*                        type: Boolean
*       '400':
*          descriptions: user is already exist
*          
*/

router.post('/signup', body('login').isEmail(), 
    body('password').isLength({min: 3, max: 32}),
    UserController.signUp
)

/**
* @swagger
* /signin:
*   post:
*     summary: user login
*     responses:
*       200:
*          descriptions: user login
*          content: 
*            application/json:
*              schema:
*                type: object
*                properties:
*                  accessToken:
*                    type: string
*                  refreshToken:
*                    type: string
*                  user:
*                    type: object
*                    properties:
*                      login:
*                        type: string
*                        unique: true
*                      id:
*                        type: string
*                      isActivated:
*                        type: Boolean
*       400:
*          descriptions: user does not exist
*/

router.post('/signin', UserController.signIn)
router.post('/logout', UserController.logOut)

/**
* @swagger
* /users:
*   get:
*     summary: Get the list of users
*     responses:
*       200:
*          descriptions: The list of the users
*          content: 
*            application/json:
*              schema:
*                type: array
*                items:
*                  $ref: '#/components/schemas/User'
*
*/

router.get('/users', authMiddleware, UserController.getAll)

/**
* @swagger
* /users/{id}:
*   get:
*     summary: Get the user by id
*     parameters:
*       -in: path
*       name: id
*       schema:
*         type: string
*       required: true 
*     responses:             
*        200:
*          content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/User'
*
*/

router.get('/user/:id', authMiddleware, UserController.getOne)
router.get('/me', authMiddleware, UserController.getMe)
router.get('/activate/:link', UserController.activate)
router.get('/refresh', UserController.refresh)
router.delete('/user/:id', UserController.delete)

module.exports = router