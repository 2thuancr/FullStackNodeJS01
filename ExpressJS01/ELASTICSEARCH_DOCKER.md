# 🐳 Elasticsearch với Docker

## Cài đặt và sử dụng Elasticsearch 8.15.0 với Docker

### 🚀 Cách 1: Sử dụng script tự động (Khuyến nghị)

```bash
# Chạy script quản lý
elasticsearch-docker.bat
```

### 🚀 Cách 2: Sử dụng Docker Compose trực tiếp

#### 1. Khởi động Elasticsearch
```bash
docker-compose up -d elasticsearch
```

#### 2. Kiểm tra trạng thái
```bash
curl http://localhost:9200
```

#### 3. Setup dữ liệu
```bash
node setup_elasticsearch.js
```

#### 4. Dừng Elasticsearch
```bash
docker-compose down
```

### 🔧 Các lệnh hữu ích

#### Xem logs
```bash
docker-compose logs -f elasticsearch
```

#### Restart Elasticsearch
```bash
docker-compose restart elasticsearch
```

#### Xóa dữ liệu và khởi động lại
```bash
docker-compose down -v
docker-compose up -d elasticsearch
```

### 📊 Kibana (Optional)

Kibana cũng được cài đặt và có thể truy cập tại: http://localhost:5601

### 🔍 Test API

Sau khi Elasticsearch chạy, test các API:

```bash
# Search suggestions
curl "http://localhost:8888/v1/api/products/search-suggestions?q=iphone"

# Fuzzy search
curl "http://localhost:8888/v1/api/products/fuzzy-search?q=iphone&limit=5"
```

### ⚙️ Cấu hình

- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601
- **Memory**: 512MB (có thể điều chỉnh trong docker-compose.yml)
- **Security**: Tắt (phù hợp cho development)

### 🐛 Troubleshooting

#### Nếu Elasticsearch không khởi động:
1. Kiểm tra port 9200 có bị chiếm không
2. Tăng memory limit trong docker-compose.yml
3. Xóa volume và khởi động lại: `docker-compose down -v`

#### Nếu API không hoạt động:
1. Đảm bảo server Node.js đang chạy: `npm run dev`
2. Chạy setup script: `node setup_elasticsearch.js`
3. Kiểm tra logs: `docker-compose logs elasticsearch`
