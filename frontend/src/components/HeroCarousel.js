import React from 'react';
import { Carousel } from 'react-bootstrap';

function HeroCarousel() {
  return (
    <Carousel className="mb-4">
      <Carousel.Item>
        <img className="d-block w-100" style={{ maxHeight: 320, objectFit: 'cover' }} src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop" alt="Banner 1" />
        <Carousel.Caption>
          <h3>Giảm giá cuối tuần</h3>
          <p>Ưu đãi đến 50% cho hàng ngàn sản phẩm.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" style={{ maxHeight: 320, objectFit: 'cover' }} src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop" alt="Banner 2" />
        <Carousel.Caption>
          <h3>Sưu tầm xu nhận quà</h3>
          <p>Mua sắm mỗi ngày nhận thêm quà tặng hấp dẫn.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" style={{ maxHeight: 320, objectFit: 'cover' }} src="https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop" alt="Banner 3" />
        <Carousel.Caption>
          <h3>Hàng mới về</h3>
          <p>Khám phá bộ sưu tập mới nhất hôm nay.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default HeroCarousel;


