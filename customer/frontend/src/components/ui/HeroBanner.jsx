import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      image: 'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/5c0c4b8b8b8b8b8b.jpg',
      title: 'Electronics Sale',
      subtitle: 'Up to 70% off on Electronics',
      cta: 'Shop Now'
    },
    {
      id: 2,
      image: 'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/5c0c4b8b8b8b8b8b.jpg',
      title: 'Fashion Deals',
      subtitle: 'New Arrivals in Fashion',
      cta: 'Explore'
    },
    {
      id: 3,
      image: 'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/5c0c4b8b8b8b8b8b.jpg',
      title: 'Home & Kitchen',
      subtitle: 'Everything for your home',
      cta: 'Discover'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative bg-gray-100">
      {/* Banner Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              <div className="relative h-64 md:h-80 lg:h-96">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-lg md:text-xl mb-4">{banner.subtitle}</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                      {banner.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Electronics', icon: '📱' },
            { name: 'Fashion', icon: '👕' },
            { name: 'Home', icon: '🏠' },
            { name: 'Beauty', icon: '💄' },
            { name: 'Sports', icon: '⚽' },
            { name: 'Books', icon: '📚' }
          ].map((category) => (
            <div key={category.name} className="text-center cursor-pointer hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-gray-700">{category.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner; 