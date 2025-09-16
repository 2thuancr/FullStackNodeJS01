-- Migration script để tạo các bảng mới cho chức năng sản phẩm yêu thích, đã xem, mua hàng và bình luận

-- 1. Tạo bảng favorite_products (sản phẩm yêu thích)
CREATE TABLE IF NOT EXISTS `favorite_products` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `productId` INT NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_product` (`userId`, `productId`),
    KEY `idx_userId` (`userId`),
    KEY `idx_productId` (`productId`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_favorite_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tạo bảng viewed_products (sản phẩm đã xem)
CREATE TABLE IF NOT EXISTS `viewed_products` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NULL, -- Cho phép guest users
    `productId` INT NOT NULL,
    `viewedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ipAddress` VARCHAR(45) NULL, -- IPv6 compatible
    `userAgent` TEXT NULL,
    `sessionId` VARCHAR(255) NULL, -- Để track guest users
    PRIMARY KEY (`id`),
    KEY `idx_userId_viewedAt` (`userId`, `viewedAt`),
    KEY `idx_productId_viewedAt` (`productId`, `viewedAt`),
    KEY `idx_sessionId_viewedAt` (`sessionId`, `viewedAt`),
    KEY `idx_viewedAt` (`viewedAt`),
    CONSTRAINT `fk_viewed_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_viewed_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng purchases (đơn hàng)
CREATE TABLE IF NOT EXISTS `purchases` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `productId` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10,2) NOT NULL,
    `totalPrice` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pending', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    `purchasedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `notes` TEXT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_userId_purchasedAt` (`userId`, `purchasedAt`),
    KEY `idx_productId_purchasedAt` (`productId`, `purchasedAt`),
    KEY `idx_status_purchasedAt` (`status`, `purchasedAt`),
    KEY `idx_purchasedAt` (`purchasedAt`),
    CONSTRAINT `fk_purchase_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_purchase_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tạo bảng comments (bình luận)
CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `productId` INT NOT NULL,
    `content` TEXT NOT NULL,
    `rating` INT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `parentId` INT NULL, -- Để reply comment
    `likes` INT NOT NULL DEFAULT 0,
    `dislikes` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_productId_isActive_createdAt` (`productId`, `isActive`, `createdAt`),
    KEY `idx_userId_createdAt` (`userId`, `createdAt`),
    KEY `idx_parentId` (`parentId`),
    KEY `idx_rating` (`rating`),
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Thêm các cột mới vào bảng products
ALTER TABLE `products` 
ADD COLUMN `purchaseCount` INT NOT NULL DEFAULT 0 AFTER `status`,
ADD COLUMN `commentCount` INT NOT NULL DEFAULT 0 AFTER `purchaseCount`;

-- 6. Tạo indexes cho các cột mới
ALTER TABLE `products` 
ADD KEY `idx_purchaseCount` (`purchaseCount`),
ADD KEY `idx_commentCount` (`commentCount`);

-- 7. Tạo view để thống kê sản phẩm
CREATE OR REPLACE VIEW `product_stats` AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.views,
    p.rating,
    p.ratingCount,
    p.purchaseCount,
    p.commentCount,
    COUNT(DISTINCT fp.userId) as favoriteCount,
    COUNT(DISTINCT vp.id) as totalViews,
    COUNT(DISTINCT CASE WHEN vp.userId IS NOT NULL THEN vp.userId END) as uniqueUserViews,
    AVG(c.rating) as avgRating,
    COUNT(DISTINCT c.id) as totalComments,
    COUNT(DISTINCT CASE WHEN c.isActive = TRUE THEN c.id END) as activeComments
FROM products p
LEFT JOIN favorite_products fp ON p.id = fp.productId
LEFT JOIN viewed_products vp ON p.id = vp.productId
LEFT JOIN comments c ON p.id = c.productId
WHERE p.isActive = TRUE
GROUP BY p.id, p.name, p.price, p.views, p.rating, p.ratingCount, p.purchaseCount, p.commentCount;

-- 8. Tạo stored procedure để cập nhật thống kê sản phẩm
DELIMITER //

CREATE PROCEDURE UpdateProductStats(IN product_id INT)
BEGIN
    DECLARE purchase_count INT DEFAULT 0;
    DECLARE comment_count INT DEFAULT 0;
    DECLARE avg_rating DECIMAL(2,1) DEFAULT 0;
    
    -- Đếm số lần mua (chỉ tính completed)
    SELECT COUNT(*) INTO purchase_count
    FROM purchases 
    WHERE productId = product_id AND status = 'completed';
    
    -- Đếm số bình luận active
    SELECT COUNT(*) INTO comment_count
    FROM comments 
    WHERE productId = product_id AND isActive = TRUE;
    
    -- Tính rating trung bình
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM comments 
    WHERE productId = product_id AND isActive = TRUE AND rating IS NOT NULL;
    
    -- Cập nhật bảng products
    UPDATE products 
    SET 
        purchaseCount = purchase_count,
        commentCount = comment_count,
        rating = avg_rating,
        ratingCount = comment_count
    WHERE id = product_id;
END //

DELIMITER ;

-- 9. Tạo trigger để tự động cập nhật thống kê khi có purchase mới
DELIMITER //

CREATE TRIGGER after_purchase_insert
AFTER INSERT ON purchases
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' THEN
        CALL UpdateProductStats(NEW.productId);
    END IF;
END //

DELIMITER ;

-- 10. Tạo trigger để tự động cập nhật thống kê khi có comment mới
DELIMITER //

CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    IF NEW.isActive = TRUE THEN
        CALL UpdateProductStats(NEW.productId);
    END IF;
END //

DELIMITER ;

-- 11. Tạo trigger để tự động cập nhật thống kê khi comment được cập nhật
DELIMITER //

CREATE TRIGGER after_comment_update
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    IF OLD.isActive != NEW.isActive OR OLD.rating != NEW.rating THEN
        CALL UpdateProductStats(NEW.productId);
    END IF;
END //

DELIMITER ;

-- 12. Tạo trigger để tự động cập nhật thống kê khi comment bị xóa
DELIMITER //

CREATE TRIGGER after_comment_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
    CALL UpdateProductStats(OLD.productId);
END //

DELIMITER ;

-- 13. Tạo trigger để tự động cập nhật thống kê khi purchase được cập nhật
DELIMITER //

CREATE TRIGGER after_purchase_update
AFTER UPDATE ON purchases
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        CALL UpdateProductStats(NEW.productId);
    END IF;
END //

DELIMITER ;

-- 14. Tạo trigger để tự động cập nhật thống kê khi purchase bị xóa
DELIMITER //

CREATE TRIGGER after_purchase_delete
AFTER DELETE ON purchases
FOR EACH ROW
BEGIN
    CALL UpdateProductStats(OLD.productId);
END //

DELIMITER ;

-- 15. Tạo index composite để tối ưu performance
CREATE INDEX idx_viewed_products_user_product_time ON viewed_products(userId, productId, viewedAt);
CREATE INDEX idx_favorite_products_user_created ON favorite_products(userId, createdAt);
CREATE INDEX idx_purchases_product_status ON purchases(productId, status);
CREATE INDEX idx_comments_product_active ON comments(productId, isActive, createdAt);

-- 16. Tạo bảng để lưu cache thống kê (optional - để tối ưu performance)
CREATE TABLE IF NOT EXISTS `product_stats_cache` (
    `productId` INT NOT NULL,
    `favoriteCount` INT NOT NULL DEFAULT 0,
    `viewCount` INT NOT NULL DEFAULT 0,
    `purchaseCount` INT NOT NULL DEFAULT 0,
    `commentCount` INT NOT NULL DEFAULT 0,
    `avgRating` DECIMAL(2,1) NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`productId`),
    CONSTRAINT `fk_stats_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

