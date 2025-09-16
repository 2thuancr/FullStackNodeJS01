require('dotenv').config();
const elasticsearchService = require('./src/services/elasticsearchService');

async function setupElasticsearch() {
    console.log('🚀 Bắt đầu setup Elasticsearch...\n');

    try {
        // 1. Kiểm tra kết nối
        console.log('1️⃣ Kiểm tra kết nối Elasticsearch...');
        const isConnected = await elasticsearchService.checkConnection();
        
        if (!isConnected) {
            console.log('❌ Không thể kết nối đến Elasticsearch!');
            console.log('📋 Hướng dẫn cài đặt Elasticsearch:');
            console.log('   1. Tải Elasticsearch: https://www.elastic.co/downloads/elasticsearch');
            console.log('   2. Chạy: bin/elasticsearch (hoặc bin/elasticsearch.bat trên Windows)');
            console.log('   3. Mặc định chạy trên: http://localhost:9200');
            console.log('   4. Username: elastic, Password: changeme');
            return;
        }

        // 2. Tạo index
        console.log('\n2️⃣ Tạo index cho products...');
        const indexCreated = await elasticsearchService.createIndex();
        
        if (!indexCreated) {
            console.log('❌ Không thể tạo index!');
            return;
        }

        // 3. Đồng bộ dữ liệu
        console.log('\n3️⃣ Đồng bộ dữ liệu từ MySQL sang Elasticsearch...');
        const syncResult = await elasticsearchService.syncAllProducts();
        
        if (!syncResult.success) {
            console.log('❌ Không thể đồng bộ dữ liệu!');
            console.log('Error:', syncResult.error);
            return;
        }

        console.log(`✅ Đã đồng bộ ${syncResult.count} sản phẩm thành công!`);

        // 4. Test fuzzy search
        console.log('\n4️⃣ Test fuzzy search...');
        const searchResult = await elasticsearchService.fuzzySearch('iphone', { limit: 3 });
        
        if (searchResult.success) {
            console.log(`✅ Tìm thấy ${searchResult.data.pagination.totalItems} sản phẩm cho từ khóa "iphone"`);
            console.log('📦 Sản phẩm đầu tiên:', searchResult.data.products[0]?.name || 'Không có');
        } else {
            console.log('❌ Test fuzzy search thất bại!');
        }

        console.log('\n🎉 Setup Elasticsearch hoàn tất!');
        console.log('📋 Các API đã sẵn sàng:');
        console.log('   - GET /v1/api/products/fuzzy-search?q=keyword');
        console.log('   - GET /v1/api/products/search-suggestions?q=keyword');
        console.log('   - Swagger UI: http://localhost:8888/api-docs');

    } catch (error) {
        console.error('❌ Lỗi trong quá trình setup:', error.message);
    }
}

// Chạy setup
setupElasticsearch();




