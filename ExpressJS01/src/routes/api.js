const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const delay = require('../middleware/delay');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated user ID
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           description: User email address
 *         password:
 *           type: string
 *           description: User password (hashed)
 *         fullName:
 *           type: string
 *           description: User's full name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *         isActive:
 *           type: boolean
 *           description: User account status
 *         isEmailVerified:
 *           type: boolean
 *           description: Email verification status
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         fullName:
 *           type: string
 *           description: User's full name
 *     SendOTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: User email to send OTP
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otpCode
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         otpCode:
 *           type: string
 *           description: 6-digit OTP code
 *     ResendOTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: User email to resend OTP
 */

/**
 * @swagger
 * /v1/api/register:
 *   post:
 *     summary: Đăng ký user mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc user đã tồn tại
 */
router.post('/register', delay(500), userController.register);

/**
 * @swagger
 * /v1/api/login:
 *   post:
 *     summary: Đăng nhập user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Email hoặc password không đúng
 */
router.post('/login', delay(500), userController.login);

/**
 * @swagger
 * /v1/api/profile:
 *   get:
 *     summary: Lấy thông tin profile của user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @swagger
 * /v1/api/users:
 *   get:
 *     summary: Lấy danh sách tất cả users (chỉ admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 */
router.get('/users', auth, adminAuth, userController.getAllUsers);

/**
 * @swagger
 * /v1/api/send-otp:
 *   post:
 *     summary: Gửi mã OTP đến email
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOTPRequest'
 *     responses:
 *       200:
 *         description: OTP đã được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Email không tồn tại hoặc dữ liệu không hợp lệ
 */
router.post('/send-otp', delay(500), userController.sendOTP);

/**
 * @swagger
 * /v1/api/verify-otp:
 *   post:
 *     summary: Xác thực mã OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         isEmailVerified:
 *                           type: boolean
 *       400:
 *         description: OTP không đúng, hết hạn hoặc dữ liệu không hợp lệ
 */
router.post('/verify-otp', delay(500), userController.verifyOTP);

/**
 * @swagger
 * /v1/api/resend-otp:
 *   post:
 *     summary: Gửi lại mã OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOTPRequest'
 *     responses:
 *       200:
 *         description: OTP mới đã được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Email không tồn tại hoặc chưa đủ thời gian để gửi lại
 */
router.post('/resend-otp', delay(500), userController.resendOTP);

/**
 * @swagger
 * /v1/api/check-email-verification/{email}:
 *   get:
 *     summary: Kiểm tra trạng thái xác thực email
 *     tags: [OTP]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email cần kiểm tra
 *     responses:
 *       200:
 *         description: Thông tin trạng thái xác thực email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isEmailVerified:
 *                       type: boolean
 *       400:
 *         description: Email không tồn tại hoặc dữ liệu không hợp lệ
 */
router.get('/check-email-verification/:email', userController.checkEmailVerification);

module.exports = router;
