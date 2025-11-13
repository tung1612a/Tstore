import React from 'react';
import { Carousel, Button } from 'react-bootstrap';
import './HeroCarousel.css';

const slides = [
  {
    id: 'mega-sale',
    background: 'linear-gradient(135deg, #1d2671 0%, #c33764 100%)',
    badge: 'Flash Sale 11.11',
    title: 'Điện tử giảm đến 50%',
    subtitle: 'Laptop, điện thoại, phụ kiện chính hãng. Freeship 63 tỉnh thành.',
    tags: ['Trả góp 0%', 'Voucher độc quyền', 'Bảo hành 24 tháng'],
    stats: [
      { label: 'Sản phẩm tham gia', value: '12K+' },
      { label: 'Ưu đãi hoàn tiền', value: '1.2 Triệu' }
    ],
    ctaText: 'Mua ngay',
    ctaHref: '/products?category=electronics',
    image: {
      src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&h=900&fit=crop',
      alt: 'Điện thoại & phụ kiện'
    },
    notes: [
      { text: 'Freeship toàn quốc', top: '20%', left: '12%' },
      { text: 'Đổi trả 15 ngày', top: '68%', left: '18%' }
    ]
  },
  {
    id: 'fashion-week',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    badge: 'New Season',
    title: 'Bộ sưu tập thời trang hè 2025',
    subtitle: 'Cập nhật outfit mỗi tuần. Hàng nghìn item từ local brand & quốc tế.',
    tags: ['AI stylist gợi ý', 'Đổi trả miễn phí', '200+ thương hiệu'],
    stats: [
      { label: 'Voucher giảm thêm', value: '300K' },
      { label: 'Khách hàng thân thiết', value: '4.8/5★' }
    ],
    ctaText: 'Khám phá lookbook',
    ctaHref: '/products?category=fashion',
    image: {
      src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=900&fit=crop',
      alt: 'Thời trang nữ'
    },
    notes: [
      { text: 'Giao nhanh 2h', top: '24%', left: '20%' },
      { text: 'Mix & match chỉ 1 chạm', top: '72%', left: '10%' }
    ]
  },
  {
    id: 'home-living',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    badge: 'Home Living',
    title: 'Combo gia dụng chuẩn xịn cho mọi nhà',
    subtitle: 'Robot hút bụi, máy lọc không khí, dụng cụ bếp chuẩn Michelin.',
    tags: ['Combo tiết kiệm 1.5 triệu', 'Bảo hành tại nhà', 'Thu cũ đổi mới'],
    stats: [
      { label: 'Điểm hài lòng', value: '98%' },
      { label: 'Giao nhanh', value: '2h nội thành' }
    ],
    ctaText: 'Xem ưu đãi xanh',
    ctaHref: '/products?category=home-living',
    image: {
      src: 'https://nhabepmart.com/wp-content/uploads/2022/02/do-gia-dung-la-gi.jpg',
      alt: 'Thiết bị gia dụng'
    },
    notes: [
      { text: 'Tiết kiệm năng lượng', top: '18%', left: '16%' },
      { text: 'Tư vấn setup miễn phí', top: '70%', left: '22%' }
    ]
  },
  {
    id: 'become-seller',
    background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    badge: 'Aladin Seller Hub',
    title: 'Bán hàng cùng Aladin, nhân đôi doanh thu',
    subtitle: 'Quản trị kho tập trung, hỗ trợ quảng cáo, giải pháp logistics toàn diện.',
    tags: ['Phí 0đ', 'Hỗ trợ 24/7', 'Công cụ phân tích'],
    stats: [
      { label: 'Thời gian đăng ký', value: '5 phút' },
      { label: 'Gian hàng hoạt động', value: '45K+' }
    ],
    ctaText: 'Đăng ký bán hàng',
    ctaHref: '/seller/apply',
    image: {
      src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&h=900&fit=crop',
      alt: 'Quản lý đơn hàng'
    },
    notes: [
      { text: 'Kênh marketing đa nền tảng', top: '26%', left: '18%' },
      { text: 'Đối soát minh bạch', top: '68%', left: '12%' }
    ]
  }
];

function HeroCarousel() {
  const handleCta = (href) => {
    if (!href) return;
    window.location.assign(href);
  };

  return (
    <Carousel className="mb-5 hero-carousel" fade interval={6000} pause="hover">
      {slides.map((slide) => (
        <Carousel.Item key={slide.id}>
          <div className="hero-slide" style={{ background: slide.background }}>
            <div className="hero-pattern" />

            <div className="hero-info">
              <div className="hero-badge">
                <span />
                {slide.badge}
              </div>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>

              <div className="hero-tags">
                {slide.tags.map((tag) => (
                  <span key={tag} className="hero-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="hero-stats">
                {slide.stats.map((stat) => (
                  <div key={stat.label} className="hero-stat">
                    <span className="hero-stat-value">{stat.value}</span>
                    <span className="hero-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="light"
                size="lg"
                className="hero-btn"
                onClick={() => handleCta(slide.ctaHref)}
              >
                {slide.ctaText}
              </Button>
            </div>

            <div className="hero-visual">
              <div className="hero-visual-backdrop" />
              <img src={slide.image.src} alt={slide.image.alt} loading="lazy" />

              {slide.notes.map((note, index) => (
                <div key={index} className="hero-note" style={{ top: note.top, left: note.left }}>
                  <span />
                  {note.text}
                </div>
              ))}
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default HeroCarousel;