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
          position: 'relative'
        }}>
          <div className="hero-content text-center">
            <h1 className="display-4 fw-bold mb-3">Giảm giá cuối tuần</h1>
            <p className="lead mb-4">Ưu đãi đến 50% cho hàng ngàn sản phẩm chất lượng</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Mua ngay
            </Button>
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
          position: 'relative'
        }}>
          <div className="hero-content text-center">
            <h1 className="display-4 fw-bold mb-3">Sưu tầm xu nhận quà</h1>
            <p className="lead mb-4">Mua sắm mỗi ngày nhận thêm quà tặng hấp dẫn</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Khám phá
            </Button>
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
          position: 'relative'
        }}>
          <div className="hero-content text-center">
            <h1 className="display-4 fw-bold mb-3">Hàng mới về</h1>
            <p className="lead mb-4">Khám phá bộ sưu tập mới nhất hôm nay</p>
            <Button variant="light" size="lg" className="px-4 py-2">
              Xem ngay
            </Button>
          </div>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}

export default HeroCarousel;


