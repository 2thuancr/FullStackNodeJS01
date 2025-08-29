// Test script cho API OTP
// Chạy: node test_otp_api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8888/v1/api';

// Test data
const testEmail = 'test@example.com';
const testOTP = '123456';

async function testOTPAPIs() {
    console.log('🧪 Bắt đầu test API OTP...\n');

    try {
        // Test 1: Gửi OTP
        console.log('1️⃣ Test gửi OTP...');
        const sendOTPResponse = await axios.post(`${BASE_URL}/send-otp`, {
            email: testEmail
        });
        console.log('✅ Gửi OTP thành công:', sendOTPResponse.data);
        console.log('');

        // Test 2: Xác thực OTP (sẽ thất bại vì OTP không đúng)
        console.log('2️⃣ Test xác thực OTP với mã sai...');
        try {
            const verifyOTPResponse = await axios.post(`${BASE_URL}/verify-otp`, {
                email: testEmail,
                otpCode: '000000'
            });
            console.log('✅ Xác thực OTP thành công:', verifyOTPResponse.data);
        } catch (error) {
            console.log('❌ Xác thực OTP thất bại (dự kiến):', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test 3: Kiểm tra trạng thái xác thực email
        console.log('3️⃣ Test kiểm tra trạng thái xác thực email...');
        const checkStatusResponse = await axios.get(`${BASE_URL}/check-email-verification/${testEmail}`);
        console.log('✅ Kiểm tra trạng thái thành công:', checkStatusResponse.data);
        console.log('');

        // Test 4: Gửi lại OTP
        console.log('4️⃣ Test gửi lại OTP...');
        const resendOTPResponse = await axios.post(`${BASE_URL}/resend-otp`, {
            email: testEmail
        });
        console.log('✅ Gửi lại OTP thành công:', resendOTPResponse.data);
        console.log('');

        console.log('🎉 Tất cả test đã hoàn thành!');

    } catch (error) {
        console.error('❌ Lỗi test:', error.response?.data || error.message);
    }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
    testOTPAPIs();
}

module.exports = { testOTPAPIs };
