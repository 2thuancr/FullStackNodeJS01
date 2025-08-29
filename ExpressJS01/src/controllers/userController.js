const userService = require('../services/userService');
const otpService = require('../services/otpService');

// Register user
const register = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await userService.findByEmail(email) || await userService.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Create new user (với isEmailVerified: false)
        const user = await userService.createUser({
            username,
            email,
            password,
            fullName,
            isEmailVerified: false // Mặc định chưa xác thực email
        });

        // Tự động gửi OTP để xác thực email
        try {
            await otpService.sendOTP(email);
        } catch (otpError) {
            console.error('Lỗi gửi OTP:', otpError.message);
            // Vẫn tạo user thành công nhưng thông báo lỗi gửi OTP
        }

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                note: 'Tài khoản đã được tạo nhưng cần xác thực email trước khi có thể đăng nhập'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Kiểm tra email đã được xác thực chưa
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra email và xác thực OTP trước.',
                data: {
                    isEmailVerified: false,
                    note: 'Gửi OTP để xác thực: POST /v1/api/send-otp'
                }
            });
        }

        // Generate token
        const token = userService.generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await userService.findById(req.user.id);
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting profile',
            error: error.message
        });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting users',
            error: error.message
        });
    }
};

// Send OTP
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const result = await otpService.sendOTP(email);
        
        res.json({
            success: true,
            message: result.message,
            data: {
                expiresIn: result.expiresIn,
                otpCode: result.otpCode // Tạm thời trả về OTP để test
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Email và mã OTP là bắt buộc'
            });
        }

        const result = await otpService.verifyOTP(email, otpCode);
        
        res.json({
            success: true,
            message: result.message,
            data: {
                user: result.user
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const result = await otpService.resendOTP(email);
        
        res.json({
            success: true,
            message: result.message,
            data: {
                expiresIn: result.expiresIn,
                otpCode: result.otpCode // Tạm thời trả về OTP để test
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check email verification status
const checkEmailVerification = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const result = await otpService.checkEmailVerificationStatus(email);
        
        res.json({
            success: true,
            message: result.message,
            data: {
                isEmailVerified: result.isEmailVerified
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getAllUsers,
    sendOTP,
    verifyOTP,
    resendOTP,
    checkEmailVerification
};
