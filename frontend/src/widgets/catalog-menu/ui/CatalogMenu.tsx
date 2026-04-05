'use client';

import { useState, useRef } from 'react';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for the catalog
const CATEGORIES = [
    {
        id: 'motor-oils',
        name: 'Моторні оливи',
        subcategories: [
            { name: '5W-30', href: '/catalog/motor-oils/5w-30' },
            { name: '5W-40', href: '/catalog/motor-oils/5w-40' },
            { name: '10W-40', href: '/catalog/motor-oils/10w-40' },
            { name: 'Синтетичні', href: '/catalog/motor-oils/synthetic' },
            { name: 'Напівсинтетичні', href: '/catalog/motor-oils/semi-synthetic' },
        ],
    },
    {
        id: 'filters',
        name: 'Автомобільні фільтри',
        subcategories: [
            { name: 'Масляні фільтри', href: '/catalog/filters/oil' },
            { name: 'Повітряні фільтри', href: '/catalog/filters/air' },
            { name: 'Фільтри салону', href: '/catalog/filters/cabin' },
            { name: 'Паливні фільтри', href: '/catalog/filters/fuel' },
        ],
    },
    {
        id: 'additives',
        name: 'Присадки та рідини',
        subcategories: [
            { name: 'Присадки в паливо', href: '/catalog/additives/fuel' },
            { name: 'Присадки в оливу', href: '/catalog/additives/oil' },
            { name: 'Антифриз / Охолоджуючі рідини', href: '/catalog/additives/coolants' },
            { name: 'Гальмівні рідини', href: '/catalog/additives/brake' },
        ],
    },
];

export const CatalogMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-content shadow-[0_0_15px_rgba(58,237,234,0.3)] transition-all hover:scale-105 hover:bg-primary-light active:scale-95">
                <LayoutGrid className="h-5 w-5" />
                Каталог
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 pt-4">
                    <div className="flex w-[850px] overflow-hidden rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl">
                        {/* Left Sidebar: Parent Categories */}
                        <div className="w-1/3 border-r border-white/5 bg-white/5 p-4 backdrop-blur-md">
                            <h3 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-copy-lighter">
                                Категорії
                            </h3>
                            <ul className="flex flex-col gap-1">
                                {CATEGORIES.map((category) => (
                                    <li key={category.id}>
                                        <button
                                            onMouseEnter={() => setActiveCategory(category)}
                                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium transition-all ${activeCategory.id === category.id
                                                ? 'bg-primary text-primary-content shadow-md scale-[1.02]'
                                                : 'text-copy-light hover:bg-white/10 hover:text-primary'
                                                }`}
                                        >
                                            {category.name}
                                            <ChevronRight className={`h-4 w-4 transition-transform ${activeCategory.id === category.id ? 'translate-x-1' : ''
                                                }`} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right content: Subcategories & Showcase */}
                        <div className="flex-1 bg-white/5 p-8">
                            <h3 className="mb-6 text-2xl font-black text-primary-content">
                                {activeCategory.name}
                            </h3>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {activeCategory.subcategories.map((sub) => (
                                    <Link
                                        key={sub.name}
                                        href={sub.href}
                                        className="group flex items-center gap-2 rounded-md py-2 font-medium text-copy-light transition-colors hover:text-primary"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-border transition-colors group-hover:bg-primary" />
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Promotional Banner Footer inside Mega Menu */}
                            <div className="mt-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary-content to-[#021817] p-6 text-white shadow-inner">
                                <p className="text-sm font-bold text-primary">Популярний вибір</p>
                                <p className="mt-1 text-lg font-black leading-tight text-white">
                                    Обирайте найкращі {activeCategory.name.toLowerCase()} для максимальної продуктивності.
                                </p>
                                <Link
                                    href={`/catalog/${activeCategory.id}`}
                                    className="mt-4 inline-block rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-content"
                                >
                                    Переглянути всі {activeCategory.name}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
