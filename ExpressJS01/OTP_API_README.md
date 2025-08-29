# API OTP - Hướng dẫn sử dụng

## Tổng quan
Hệ thống OTP (One-Time Password) được tích hợp vào API để xác thực email người dùng. Hệ thống bao gồm 4 API chính:

## 1. Gửi OTP (Send OTP)
**Endpoint:** `POST /v1/api/send-otp`

**Mô tả:** Gửi mã OTP 6 số đến email của người dùng

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Mã OTP đã được gửi đến email của bạn",
    "data": {
        "expiresIn": "10 phút"
    }
}
```

## 2. Xác thực OTP (Verify OTP)
**Endpoint:** `POST /v1/api/verify-otp`

**Mô tả:** Xác thực mã OTP đã nhận

**Request Body:**
```json
{
    "email": "user@example.com",
    "otpCode": "123456"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Xác thực OTP thành công",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "fullName": "Nguyễn Văn A",
            "isEmailVerified": true
        }
    }
}
```

## 3. Gửi lại OTP (Resend OTP)
**Endpoint:** `POST /v1/api/resend-otp`

**Mô tả:** Gửi lại mã OTP mới (có giới hạn thời gian)

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Mã OTP đã được gửi đến email của bạn",
    "data": {
        "expiresIn": "10 phút"
    }
}
```

## 4. Kiểm tra trạng thái xác thực email
**Endpoint:** `GET /v1/api/check-email-verification/{email}`

**Mô tả:** Kiểm tra xem email đã được xác thực chưa

**Response thành công:**
```json
{
    "success": true,
    "message": "Email đã được xác thực",
    "data": {
        "isEmailVerified": true
    }
}
```

## Cấu hình SMTP
Để sử dụng API OTP, bạn cần cấu hình SMTP trong file `config.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Lưu ý cho Gmail:**
- Sử dụng App Password thay vì mật khẩu thông thường
- Bật 2FA cho tài khoản Gmail
- Tạo App Password trong Google Account Settings

## Tính năng bảo mật
1. **Thời gian hết hạn:** OTP có hiệu lực trong 10 phút
2. **Giới hạn gửi lại:** Phải đợi 1 phút trước khi gửi lại OTP
3. **Xóa OTP:** OTP được xóa sau khi xác thực thành công
4. **Validation:** Kiểm tra email tồn tại trước khi gửi OTP

## Database Schema
Bảng `users` đã được cập nhật với các trường OTP:

```sql
-- OTP fields
otpCode VARCHAR(6) NULL,
otpExpiresAt TIMESTAMP NULL,
isEmailVerified BOOLEAN DEFAULT false
```

## Sử dụng trong ứng dụng
1. **Đăng ký:** Gửi OTP sau khi đăng ký thành công
2. **Quên mật khẩu:** Gửi OTP để xác thực trước khi đặt lại mật khẩu
3. **Xác thực email:** Yêu cầu xác thực email trước khi sử dụng một số tính năng
4. **Bảo mật:** Xác thực 2 lớp cho các thao tác quan trọng

## Testing
Bạn có thể test API bằng Swagger UI tại: `http://localhost:8888/api-docs`

## Lưu ý
- Đảm bảo cấu hình SMTP đúng trước khi test
- OTP chỉ được gửi đến email đã đăng ký trong hệ thống
- Mỗi OTP chỉ có thể sử dụng một lần
- Hệ thống tự động xóa OTP đã hết hạn
