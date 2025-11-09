import React from 'react';
import { Carousel, Button } from 'react-bootstrap';
import './HeroCarousel.css';
import { useTranslation } from 'react-i18next';


function HeroCarousel() {
  const { t } = useTranslation();
  return (
    <Carousel className="mb-5 hero-carousel" fade interval={5000}>
      <Carousel.Item>
        <div className="hero-slide" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3" style={{ fontSize: '3.5rem', fontWeight: 800 }}>{t('HeroCarousel.0')}</h1>
            <p className="lead mb-4" style={{ fontSize: '1.3rem', opacity: 0.95 }}>{t('HeroCarousel.1')}</p>
            <Button variant="light" size="lg" className="hero-btn">
              {t('HeroCarousel.2')}
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
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3" style={{ fontSize: '3.5rem', fontWeight: 800 }}>{t('HeroCarousel.3')}</h1>
            <p className="lead mb-4" style={{ fontSize: '1.3rem', opacity: 0.95 }}>{t('HeroCarousel.4')}</p>
            <Button variant="light" size="lg" className="hero-btn">
              {t('HeroCarousel.5')}
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
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3" style={{ fontSize: '3.5rem', fontWeight: 800 }}>{t('HeroCarousel.6')}</h1>
            <p className="lead mb-4" style={{ fontSize: '1.3rem', opacity: 0.95 }}>{t('HeroCarousel.7')}</p>
            <Button variant="light" size="lg" className="hero-btn">
              {t('HeroCarousel.8')}
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
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="hero-content text-center" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold mb-3" style={{ fontSize: '3.5rem', fontWeight: 800 }}>{t('HeroCarousel.9')}</h1>
            <p className="lead mb-4" style={{ fontSize: '1.3rem', opacity: 0.95 }}>{t('HeroCarousel.10')}</p>
            <Button variant="light" size="lg" className="hero-btn">
              {t('HeroCarousel.11')}
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


