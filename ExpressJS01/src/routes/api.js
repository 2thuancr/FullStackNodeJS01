const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const favoriteController = require('../controllers/favoriteController');
const viewedProductController = require('../controllers/viewedProductController');
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
 *     summary: Đăng nhập user và lấy JWT token
 *     description: |
 *       **Hướng dẫn sử dụng token trong Swagger:**
 *       1. Gọi API này với email và password để lấy token
 *       2. Copy token từ response (không bao gồm "Bearer ")
 *       3. Click nút "Authorize" (🔒) ở trên cùng Swagger UI
 *       4. Paste token vào trường "Value"
 *       5. Click "Authorize" và "Close"
 *       6. Bây giờ có thể test các API cần authentication
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
     *       - in: query
     *         name: minViews
     *         schema:
     *           type: integer
     *           minimum: 0
     *         description: Số lượt xem tối thiểu
     *       - in: query
     *         name: maxViews
     *         schema:
     *           type: integer
     *           minimum: 0
     *         description: Số lượt xem tối đa
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
/**
 * @swagger
 * /v1/api/products/fuzzy-search:
 *   get:
 *     summary: Tìm kiếm sản phẩm với Fuzzy Search (Elasticsearch)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
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
 *         description: ID danh mục
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
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Đánh giá tối thiểu (0-5 sao)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, out_of_stock, discontinued]
 *         description: Trạng thái sản phẩm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, views, rating, discount, relevance]
 *           default: createdAt
 *         description: Sắp xếp theo
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Tìm kiếm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tìm thấy 5 sản phẩm cho từ khóa "iphone"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/products/fuzzy-search', productController.fuzzySearch);

/**
 * @swagger
 * /v1/api/products/search-suggestions:
 *   get:
 *     summary: Lấy gợi ý từ khóa tìm kiếm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Số lượng gợi ý
 *     responses:
 *       200:
 *         description: Lấy gợi ý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         example: iPhone 15 Pro Max
 *                       score:
 *                         type: number
 *                         example: 1.5
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/products/search-suggestions', productController.getSearchSuggestions);

router.get('/products/discount-ranges', productController.getDiscountRanges);

/**
 * @swagger
 * /v1/api/products/view-count-ranges:
 *   get:
 *     summary: Lấy danh sách các khoảng view count có sẵn
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lấy danh sách khoảng view count thành công
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
 *                         example: "Dưới 1,000 lượt xem"
 *                       minViews:
 *                         type: integer
 *                         example: 0
 *                       maxViews:
 *                         type: integer
 *                         nullable: true
 *                         example: 999
 *                       description:
 *                         type: string
 *                         example: "Sản phẩm mới"
 *                       color:
 *                         type: string
 *                         example: "#2196F3"
 *                       icon:
 *                         type: string
 *                         example: "🆕"
 *                       productCount:
 *                         type: integer
 *                         example: 15
 *       500:
 *         description: Lỗi server
 */
router.get('/products/view-count-ranges', productController.getViewCountRanges);

/**
 * @swagger
 * /v1/api/products/{id}/increment-view:
 *   post:
 *     summary: Tăng view count cho sản phẩm
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
 *         description: Tăng view count thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tăng view count thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     productName:
 *                       type: string
 *                       example: iPhone 15 Pro Max
 *                     newViewCount:
 *                       type: integer
 *                       example: 1250
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
router.post('/products/:id/increment-view', productController.incrementProductView);

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

// ==================== FAVORITE PRODUCTS ROUTES ====================

/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Favorite ID
 *         userId:
 *           type: integer
 *           description: User ID
 *         productId:
 *           type: integer
 *           description: Product ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian thêm vào yêu thích
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     AddFavoriteRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID sản phẩm cần thêm vào yêu thích
 *     FavoriteListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             favorites:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   addedAt:
 *                     type: string
 *                     format: date-time
 *                   product:
 *                     $ref: '#/components/schemas/Product'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /v1/api/favorites:
 *   post:
 *     summary: Thêm sản phẩm vào danh sách yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: JWT token để xác thực (lấy từ API /v1/api/login)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFavoriteRequest'
 *     responses:
 *       201:
 *         description: Thêm sản phẩm vào yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đã thêm sản phẩm vào danh sách yêu thích
 *                 data:
 *                   type: object
 *                   properties:
 *                     favoriteId:
 *                       type: integer
 *                     productId:
 *                       type: integer
 *                     productName:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc sản phẩm đã có trong yêu thích
 *       404:
 *         description: Sản phẩm không tồn tại
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.post('/favorites', auth, delay(300), favoriteController.addToFavorites);

/**
 * @swagger
 * /v1/api/favorites/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi danh sách yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm cần xóa khỏi yêu thích
 *     responses:
 *       200:
 *         description: Xóa sản phẩm khỏi yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đã xóa sản phẩm khỏi danh sách yêu thích
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       404:
 *         description: Sản phẩm không có trong danh sách yêu thích
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.delete('/favorites/:productId', auth, delay(300), favoriteController.removeFromFavorites);

/**
 * @swagger
 * /v1/api/favorites:
 *   get:
 *     summary: Lấy danh sách sản phẩm yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: JWT token để xác thực (lấy từ API /v1/api/login)
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, price, rating, views, newest]
 *           default: createdAt
 *         description: Trường sắp xếp (newest = createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteListResponse'
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/favorites', auth, favoriteController.getFavoriteProducts);

/**
 * @swagger
 * /v1/api/favorites/check/{productId}:
 *   get:
 *     summary: Kiểm tra trạng thái yêu thích của sản phẩm
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm cần kiểm tra
 *     responses:
 *       200:
 *         description: Kiểm tra trạng thái yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isFavorite:
 *                       type: boolean
 *                       example: true
 *                     favoriteId:
 *                       type: integer
 *                       nullable: true
 *                       example: 123
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/favorites/check/:productId', auth, favoriteController.checkFavoriteStatus);

/**
 * @swagger
 * /v1/api/favorites/count:
 *   get:
 *     summary: Lấy số lượng sản phẩm yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy số lượng sản phẩm yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     favoriteCount:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/favorites/count', auth, favoriteController.getFavoriteCount);

/**
 * @swagger
 * /v1/api/favorites/product/{productId}/users:
 *   get:
 *     summary: Lấy danh sách user đã yêu thích sản phẩm (admin only)
 *     tags: [Favorites, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
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
 *         description: Số user mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách user yêu thích sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           favoriteId:
 *                             type: integer
 *                           addedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/favorites/product/:productId/users', auth, adminAuth, favoriteController.getProductFavorites);

/**
 * @swagger
 * /v1/api/favorites/clear:
 *   delete:
 *     summary: Xóa tất cả sản phẩm yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa tất cả sản phẩm yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đã xóa 15 sản phẩm khỏi danh sách yêu thích
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.delete('/favorites/clear', auth, delay(500), favoriteController.clearAllFavorites);

// ==================== VIEWED PRODUCTS ROUTES ====================

/**
 * @swagger
 * components:
 *   schemas:
 *     ViewedProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: View ID
 *         userId:
 *           type: integer
 *           nullable: true
 *           description: User ID (null for guest)
 *         productId:
 *           type: integer
 *           description: Product ID
 *         viewedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian xem
 *         ipAddress:
 *           type: string
 *           nullable: true
 *           description: IP address
 *         sessionId:
 *           type: string
 *           nullable: true
 *           description: Session ID cho guest
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     TrackViewRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID sản phẩm cần ghi nhận lượt xem
 *     ViewedListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             viewedProducts:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   viewedAt:
 *                     type: string
 *                     format: date-time
 *                   product:
 *                     $ref: '#/components/schemas/Product'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *             filters:
 *               type: object
 *               properties:
 *                 days:
 *                   type: integer
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: Trang hiện tại
 *         totalPages:
 *           type: integer
 *           description: Tổng số trang
 *         totalItems:
 *           type: integer
 *           description: Tổng số items
 *         itemsPerPage:
 *           type: integer
 *           description: Số items mỗi trang
 *         hasNextPage:
 *           type: boolean
 *           description: Có trang tiếp theo không
 *         hasPrevPage:
 *           type: boolean
 *           description: Có trang trước không
 */

/**
 * @swagger
 * /v1/api/viewed-products:
 *   post:
 *     summary: Ghi nhận sản phẩm đã xem
 *     tags: [Viewed Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrackViewRequest'
 *     responses:
 *       201:
 *         description: Ghi nhận lượt xem thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đã ghi nhận lượt xem sản phẩm
 *                 data:
 *                   type: object
 *                   properties:
 *                     viewId:
 *                       type: integer
 *                     productId:
 *                       type: integer
 *                     isNewView:
 *                       type: boolean
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Sản phẩm không tồn tại
 */
router.post('/viewed-products', delay(200), viewedProductController.trackProductView);

/**
 * @swagger
 * /v1/api/viewed-products:
 *   get:
 *     summary: Lấy lịch sử xem sản phẩm của user
 *     tags: [Viewed Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: JWT token để xác thực (lấy từ API /v1/api/login)
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [viewedAt, name, price, rating]
 *           default: viewedAt
 *         description: Trường sắp xếp
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Số ngày gần đây để lấy lịch sử
 *     responses:
 *       200:
 *         description: Lấy lịch sử xem sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ViewedListResponse'
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/viewed-products', auth, viewedProductController.getViewedProducts);

/**
 * @swagger
 * /v1/api/viewed-products/guest:
 *   get:
 *     summary: Lấy lịch sử xem sản phẩm của guest
 *     tags: [Viewed Products]
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
 *           maximum: 50
 *           default: 10
 *         description: Số sản phẩm mỗi trang
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Số ngày gần đây để lấy lịch sử
 *     responses:
 *       200:
 *         description: Lấy lịch sử xem sản phẩm của guest thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ViewedListResponse'
 *       400:
 *         description: Tham số không hợp lệ hoặc không có session ID
 *       500:
 *         description: Lỗi server
 */
router.get('/viewed-products/guest', viewedProductController.getGuestViewedProducts);

/**
 * @swagger
 * /v1/api/viewed-products:
 *   delete:
 *     summary: Xóa lịch sử xem sản phẩm
 *     tags: [Viewed Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: ID sản phẩm cần xóa (nếu không có thì xóa tất cả)
 *     responses:
 *       200:
 *         description: Xóa lịch sử xem sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đã xóa 15 lượt xem khỏi lịch sử
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.delete('/viewed-products', auth, delay(300), viewedProductController.clearViewedHistory);

/**
 * @swagger
 * /v1/api/viewed-products/statistics:
 *   get:
 *     summary: Lấy thống kê xem sản phẩm
 *     tags: [Viewed Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Số ngày gần đây để thống kê
 *     responses:
 *       200:
 *         description: Lấy thống kê xem sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalViews:
 *                       type: integer
 *                       example: 150
 *                     uniqueProducts:
 *                       type: integer
 *                       example: 25
 *                     mostViewed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             $ref: '#/components/schemas/Product'
 *                           viewCount:
 *                             type: integer
 *                     dailyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           viewCount:
 *                             type: integer
 *                     period:
 *                       type: object
 *                       properties:
 *                         days:
 *                           type: integer
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/viewed-products/statistics', auth, viewedProductController.getViewStatistics);

/**
 * @swagger
 * /v1/api/viewed-products/most-viewed:
 *   get:
 *     summary: Lấy danh sách sản phẩm được xem nhiều nhất (admin)
 *     tags: [Viewed Products, Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Số ngày gần đây để thống kê
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm được xem nhiều nhất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mostViewed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             $ref: '#/components/schemas/Product'
 *                           viewCount:
 *                             type: integer
 *                           lastViewedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/viewed-products/most-viewed', auth, adminAuth, viewedProductController.getMostViewedProducts);

// ==================== DEBUG/ADMIN ROUTES ====================

/**
 * @swagger
 * /v1/api/debug/favorites:
 *   get:
 *     summary: Debug - Xem tất cả sản phẩm yêu thích (không cần auth)
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Danh sách tất cả sản phẩm yêu thích
 */
router.get('/debug/favorites', async (req, res) => {
    try {
        const { FavoriteProduct, Product, User } = require('../models');
        
        const favorites = await FavoriteProduct.findAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'imageUrl']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json({
            success: true,
            message: 'Debug: Tất cả sản phẩm yêu thích',
            data: {
                total: favorites.length,
                favorites: favorites.map(fav => ({
                    id: fav.id,
                    userId: fav.userId,
                    productId: fav.productId,
                    addedAt: fav.createdAt,
                    user: fav.user,
                    product: fav.product
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu debug',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /v1/api/debug/viewed:
 *   get:
 *     summary: Debug - Xem tất cả lượt xem sản phẩm (không cần auth)
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Danh sách tất cả lượt xem
 */
router.get('/debug/viewed', async (req, res) => {
    try {
        const { ViewedProduct, Product, User } = require('../models');
        
        const viewed = await ViewedProduct.findAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'imageUrl']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['viewedAt', 'DESC']],
            limit: 20
        });

        res.json({
            success: true,
            message: 'Debug: Tất cả lượt xem sản phẩm',
            data: {
                total: viewed.length,
                viewed: viewed.map(view => ({
                    id: view.id,
                    userId: view.userId,
                    productId: view.productId,
                    viewedAt: view.viewedAt,
                    sessionId: view.sessionId,
                    user: view.user,
                    product: view.product
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu debug',
            error: error.message
        });
    }
});

module.exports = router;
