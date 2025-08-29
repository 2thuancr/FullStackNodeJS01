const User = require('../models/user');
const nodemailer = require('nodemailer');

class OtpService {
    constructor() {
        // Cấu hình email transporter (cần cập nhật với thông tin SMTP thực tế)
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Tạo mã OTP ngẫu nhiên 6 số
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Gửi OTP qua email
    async sendOTP(email) {
        try {
            // Tìm user theo email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email không tồn tại trong hệ thống');
            }

            // Tạo mã OTP mới
            const otpCode = this.generateOTP();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

            // Cập nhật OTP vào database
            await user.update({
                otpCode,
                otpExpiresAt
            });

            // GỬI EMAIL THẬT
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Mã xác thực OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Mã xác thực OTP</h2>
                        <p>Xin chào ${user.fullName},</p>
                        <p>Mã xác thực OTP của bạn là:</p>
                        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
                        </div>
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Mã OTP có hiệu lực trong 10 phút</li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
                        </ul>
                        <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);

            // TẠM THỜI: Vẫn log OTP ra console để debug
            console.log(`\n🔐 ==========================================`);
            console.log(`🔐 OTP cho ${email}: ${otpCode}`);
            console.log(`🔐 Hết hạn: ${otpExpiresAt.toLocaleString('vi-VN')}`);
            console.log(`🔐 ==========================================\n`);

            return {
                success: true,
                message: 'Mã OTP đã được gửi đến email của bạn',
                expiresIn: '10 phút'
            };
        } catch (error) {
            throw error;
        }
    }

    // Xác thực OTP
    async verifyOTP(email, otpCode) {
        try {
            // Tìm user theo email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email không tồn tại trong hệ thống');
            }

            // Kiểm tra OTP có hợp lệ không
            if (!user.isOtpValid(otpCode)) {
                if (user.isOtpExpired()) {
                    throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
                } else {
                    throw new Error('Mã OTP không đúng');
                }
            }

            // Xác thực thành công, cập nhật trạng thái
            await user.update({
                isEmailVerified: true,
                otpCode: null,
                otpExpiresAt: null
            });

            return {
                success: true,
                message: 'Xác thực OTP thành công',
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    isEmailVerified: user.isEmailVerified
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Gửi lại OTP
    async resendOTP(email) {
        try {
            // Kiểm tra xem có thể gửi lại OTP không (tránh spam)
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email không tồn tại trong hệ thống');
            }

            // Kiểm tra thời gian gửi OTP trước đó
            if (user.otpExpiresAt && new Date() < new Date(user.otpExpiresAt.getTime() + 60000)) {
                throw new Error('Vui lòng đợi 1 phút trước khi yêu cầu mã OTP mới');
            }

            // Gửi OTP mới
            return await this.sendOTP(email);
        } catch (error) {
            throw error;
        }
    }

    // Kiểm tra trạng thái xác thực email
    async checkEmailVerificationStatus(email) {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email không tồn tại trong hệ thống');
            }

            return {
                success: true,
                isEmailVerified: user.isEmailVerified,
                message: user.isEmailVerified ? 'Email đã được xác thực' : 'Email chưa được xác thực'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OtpService();
