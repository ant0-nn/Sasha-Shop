'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/entities/banner/model/types';

interface BannerSliderProps {
    banners: Banner[];
}

export const BannerSlider = ({ banners }: BannerSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeBanners = banners.filter(b => b.isActive);

    useEffect(() => {
        if (activeBanners.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000); // 5 seconds autoplay

        return () => clearInterval(interval);
    }, [activeBanners.length]);

    if (activeBanners.length === 0) return null;

    const currentBanner = activeBanners[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden rounded-3xl group shadow-2xl">
            {/* Background Images with Crossfade */}
            {activeBanners.map((banner, idx) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
                </div>
            ))}

            {/* Content (Title, Description, Button) */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 sm:px-16 max-w-2xl">
                <h2 className="text-4xl sm:text-5xl font-black text-primary-content tracking-tight leading-tight mb-4 drop-shadow-md">
                    {currentBanner.title}
                </h2>
                {currentBanner.description && (
                    <p className="text-lg text-copy-light mb-8 drop-shadow-sm">
                        {currentBanner.description}
                    </p>
                )}
                {currentBanner.linkUrl && (
                    <Link
                        href={currentBanner.linkUrl}
                        className="w-max rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-content shadow-[0_0_20px_rgba(58,237,234,0.4)] transition-all hover:scale-105 hover:bg-primary-light active:scale-95"
                    >
                        Детальніше
                    </Link>
                )}
            </div>

            {/* Controls */}
            {activeBanners.length > 1 && (
                <>
                    {/* Navigation Arrows */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-background/50 p-2.5 text-white backdrop-blur-md opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-content hover:scale-110"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-background/50 p-2.5 text-white backdrop-blur-md opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-content hover:scale-110"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3 bg-background/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        {activeBanners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    idx === currentIndex
                                        ? 'w-8 bg-primary shadow-[0_0_10px_rgba(58,237,234,0.8)]'
                                        : 'w-2.5 bg-white/50 hover:bg-white'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
