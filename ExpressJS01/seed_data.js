require('dotenv').config({ path: './config.env' });
const { Category, Product } = require('./src/models');

async function seedData() {
    try {
        console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

        // Tạo categories
        const categories = await Category.bulkCreate([
            {
                name: 'Điện thoại',
                description: 'Các loại điện thoại di động và phụ kiện'
            },
            {
                name: 'Laptop',
                description: 'Máy tính xách tay và phụ kiện'
            },
            {
                name: 'Đồng hồ',
                description: 'Đồng hồ đeo tay thông minh và truyền thống'
            },
            {
                name: 'Tai nghe',
                description: 'Tai nghe không dây và có dây'
            }
        ]);

        console.log('✅ Đã tạo categories:', categories.length);

        // Tạo products
        const products = await Product.bulkCreate([
            // Điện thoại
            {
                name: 'iPhone 15 Pro Max',
                description: 'iPhone 15 Pro Max 256GB - Titanium Natural',
                price: 29990000,
                categoryId: categories[0].id,
                imageUrl: 'https://example.com/iphone15.jpg',
                stock: 50
            },
            {
                name: 'Samsung Galaxy S24 Ultra',
                description: 'Samsung Galaxy S24 Ultra 512GB - Titanium Black',
                price: 27990000,
                categoryId: categories[0].id,
                imageUrl: 'https://example.com/s24ultra.jpg',
                stock: 30
            },
            {
                name: 'Xiaomi 14 Pro',
                description: 'Xiaomi 14 Pro 256GB - Black',
                price: 18990000,
                categoryId: categories[0].id,
                imageUrl: 'https://example.com/xiaomi14.jpg',
                stock: 25
            },
            // Laptop
            {
                name: 'MacBook Pro 16" M3 Max',
                description: 'MacBook Pro 16-inch với chip M3 Max, 32GB RAM, 1TB SSD',
                price: 89990000,
                categoryId: categories[1].id,
                imageUrl: 'https://example.com/macbook16.jpg',
                stock: 15
            },
            {
                name: 'Dell XPS 15',
                description: 'Dell XPS 15 9530 - Intel i7, 16GB RAM, 512GB SSD',
                price: 45990000,
                categoryId: categories[1].id,
                imageUrl: 'https://example.com/dellxps15.jpg',
                stock: 20
            },
            {
                name: 'ASUS ROG Strix G15',
                description: 'ASUS ROG Strix G15 - AMD Ryzen 7, RTX 4060, 16GB RAM',
                price: 32990000,
                categoryId: categories[1].id,
                imageUrl: 'https://example.com/asusrog.jpg',
                stock: 12
            },
            // Đồng hồ
            {
                name: 'Apple Watch Series 9',
                description: 'Apple Watch Series 9 GPS 45mm - Midnight',
                price: 8990000,
                categoryId: categories[2].id,
                imageUrl: 'https://example.com/applewatch9.jpg',
                stock: 40
            },
            {
                name: 'Samsung Galaxy Watch 6 Classic',
                description: 'Samsung Galaxy Watch 6 Classic 47mm - Black',
                price: 6990000,
                categoryId: categories[2].id,
                imageUrl: 'https://example.com/galaxywatch6.jpg',
                stock: 35
            },
            // Tai nghe
            {
                name: 'AirPods Pro 2',
                description: 'AirPods Pro (2nd generation) với MagSafe Charging Case',
                price: 5990000,
                categoryId: categories[3].id,
                imageUrl: 'https://example.com/airpodspro2.jpg',
                stock: 60
            },
            {
                name: 'Sony WH-1000XM5',
                description: 'Sony WH-1000XM5 - Tai nghe chống ồn cao cấp',
                price: 7990000,
                categoryId: categories[3].id,
                imageUrl: 'https://example.com/sonyxm5.jpg',
                stock: 25
            },
            {
                name: 'Bose QuietComfort 45',
                description: 'Bose QuietComfort 45 - Tai nghe chống ồn',
                price: 6990000,
                categoryId: categories[3].id,
                imageUrl: 'https://example.com/boseqc45.jpg',
                stock: 18
            }
        ]);

        console.log('✅ Đã tạo products:', products.length);
        console.log('🎉 Hoàn thành tạo dữ liệu mẫu!');

    } catch (error) {
        console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
    }
}

// Chạy script
seedData().then(() => {
    console.log('✨ Script hoàn thành!');
    process.exit(0);
});
