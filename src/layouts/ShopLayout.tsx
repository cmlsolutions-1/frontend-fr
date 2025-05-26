// src/components/layouts/ShopLayout.tsx
import React from 'react';
import { TopMenu } from '@/components/ui/top-menu/TopMenu';
import { Sidebar } from '@/components/ui/sidebar/Sidebar';
import { Footer } from '@/components/ui/footer/Footer';
import { CategoryHeader } from '@/components/ui/CategoryHeader';



interface Props {
  children: React.ReactNode;
}

export const ShopLayout: React.FC<Props> = ({ children }) => {
  return (
    <main className="min-h-screen">
      <TopMenu />
      <Sidebar />
      <CategoryHeader/>

      <div className="px-0 sm:px-10">
        {children}
      </div>

      <Footer />
    </main>
  );
};