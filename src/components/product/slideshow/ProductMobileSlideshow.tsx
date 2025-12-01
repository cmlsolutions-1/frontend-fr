import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import './slideshow.css';

interface Props {
  images?: string[];
  title: string;
  className?: string;
}

// Función para optimizar la URL de Cloudinary
const optimizeCloudinaryUrl = (url: string) => {
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_800,h_600/');
  }
  return url;
};

export const ProductMobileSlideshow = ({ images = [], title, className }: Props) => {
  return (
    <div className={`${className} w-full`}>
      <Swiper
        style={{ width: '100vw', height: '400px' }}
        pagination
        autoplay={{ delay: 2500 }}
        modules={[FreeMode, Autoplay, Pagination]}
        className="mySwiper2 bg-white rounded-lg"
      >
        {images.map((image) => (
          <SwiperSlide key={image}>
            <div className="aspect-square flex items-center justify-center bg-white">
              <img
                src={optimizeCloudinaryUrl(image)}
                alt={title}
                className="object-contain max-w-full max-h-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg';
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
