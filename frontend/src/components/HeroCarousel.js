import React from 'react';
import { Carousel, Button } from 'react-bootstrap';

function HeroCarousel() {
  return (
    <Carousel className="mb-5 hero-carousel" fade>
      <Carousel.Item>
        <div className="hero-slide" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3">Giảm giá cuối tuần</h1>
            <p className="lead mb-4">Ưu đãi đến 50% cho hàng ngàn sản phẩm chất lượng</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Mua ngay
            </Button>
          </div>
          <div className="hero-image" style={{
            position: 'absolute',
            right: '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            opacity: 0.3
          }}>
            <img 
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&crop=center" 
              alt="Smartphone" 
              style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px' }}
            />
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className="hero-slide" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3">Sưu tầm xu nhận quà</h1>
            <p className="lead mb-4">Mua sắm mỗi ngày nhận thêm quà tặng hấp dẫn</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Khám phá
            </Button>
          </div>
          <div className="hero-image" style={{
            position: 'absolute',
            right: '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            opacity: 0.3
          }}>
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center" 
              alt="Headphones" 
              style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px' }}
            />
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className="hero-slide" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3">Hàng mới về</h1>
            <p className="lead mb-4">Khám phá bộ sưu tập mới nhất hôm nay</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Xem ngay
            </Button>
          </div>
          <div className="hero-image" style={{
            position: 'absolute',
            right: '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            opacity: 0.3
          }}>
            <img 
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop&crop=center" 
              alt="Laptop" 
              style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px' }}
            />
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className="hero-slide" style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3">Thiết bị công nghệ</h1>
            <p className="lead mb-4">Điện thoại, laptop, tablet và phụ kiện cao cấp</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Mua sắm ngay
            </Button>
          </div>
          <div className="hero-image" style={{
            position: 'absolute',
            right: '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            opacity: 0.3
          }}>
            <img 
              src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop&crop=center" 
              alt="Tablet" 
              style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '20px' }}
            />
          </div>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}

export default HeroCarousel;


