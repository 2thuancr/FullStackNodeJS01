const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
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
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Category ID
 *         name:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *           description: Category description
 *         isActive:
 *           type: boolean
 *           description: Category status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price
 *         categoryId:
 *           type: integer
 *           description: Category ID
 *         imageUrl:
 *           type: string
 *           description: Product image URL
 *         stock:
 *           type: integer
 *           description: Product stock quantity
 *         isActive:
 *           type: boolean
 *           description: Product status
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             products:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             pagination:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 itemsPerPage:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 hasPrevPage:
 *                   type: boolean
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

/**
 * @swagger
 * /v1/api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm với phân trang
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số sản phẩm mỗi trang
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: ID danh mục để lọc sản phẩm
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, views, rating, discount]
 *           default: createdAt
 *         description: Trường sắp xếp
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Giá tối thiểu
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Giá tối đa
 *       - in: query
 *         name: minDiscount
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Phần trăm giảm giá tối thiểu (0-100%)
 *       - in: query
 *         name: maxDiscount
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Phần trăm giảm giá tối đa (0-100%)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Đánh giá tối thiểu (0-5 sao, ví dụ 3.5 sẽ lấy sản phẩm từ 3.5 sao trở lên)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, out_of_stock, discontinued]
 *         description: Trạng thái sản phẩm
 *       - in: query
 *         name: popular
 *         schema:
 *           type: boolean
 *         description: Sản phẩm phổ biến (lượt xem cao)
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *       400:
 *         description: Tham số không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/products', productController.getProducts);

/**
 * @swagger
 * /v1/api/products/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Lấy thông tin sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
/**
 * @swagger
 * /v1/api/products/discount-ranges:
 *   get:
 *     summary: Lấy danh sách các khoảng discount có sẵn
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lấy danh sách khoảng discount thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         description: Nhãn hiển thị (ví dụ 0% - 5%)
 *                       minDiscount:
 *                         type: number
 *                         description: Phần trăm giảm giá tối thiểu
 *                       maxDiscount:
 *                         type: number
 *                         description: Phần trăm giảm giá tối đa
 *                       description:
 *                         type: string
 *                         description: Mô tả khoảng discount
 *                       productCount:
 *                         type: integer
 *                         description: Số lượng sản phẩm trong khoảng này
 *       500:
 *         description: Lỗi server
 */
router.get('/products/discount-ranges', productController.getDiscountRanges);

router.get('/products/:id', productController.getProductById);

/**
 * @swagger
 * /v1/api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lấy danh sách danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Lỗi server
 */
router.get('/categories', productController.getCategories);

module.exports = router;
