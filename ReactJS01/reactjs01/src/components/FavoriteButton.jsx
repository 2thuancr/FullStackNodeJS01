import React, { useState, useEffect, memo } from 'react';
import { Button, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useFavorite } from './context/FavoriteContext';

const FavoriteButton = memo(({ 
  productId, 
  size = 'middle', 
  showText = false, 
  style = {},
  className = '',
  onToggle = null 
}) => {
  const { isFavorite, toggleFavorite, checkFavoriteStatus } = useFavorite();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      checkFavoriteStatus(productId).then(setIsFav);
    }
  }, [productId]);

  const handleToggle = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const success = await toggleFavorite(productId);
      if (success) {
        setIsFav(!isFav);
        if (onToggle) {
          onToggle(!isFav);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isFav ? 'Bỏ yêu thích' : 'Yêu thích';
  const icon = isFav ? <HeartFilled /> : <HeartOutlined />;
  const buttonType = isFav ? 'primary' : 'default';

  return (
    <Tooltip title={buttonText}>
      <Button
        type={buttonType}
        icon={icon}
        size={size}
        loading={loading}
        onClick={handleToggle}
        style={{
          color: isFav ? '#ff4d4f' : undefined,
          borderColor: isFav ? '#ff4d4f' : undefined,
          ...style
        }}
        className={className}
      >
        {showText && buttonText}
      </Button>
    </Tooltip>
  );
});

export default FavoriteButton;

