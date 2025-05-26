import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import { ShopLayout } from "@/layouts/ShopLayout";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryByPage } from "@/pages/CategoryByPage";
import {CartPage} from "@/pages/cart/CartPage";
import { EmptyPage } from "@/pages/cart/empty/page";
import { ProductPage } from '@/pages/product/ProductPage';
import { NotFoundPage } from "@/pages/not-found";
import ContenedorPage from "@/pages/ContenedorPage";
import AdminContenedorPage from "@/pages/AdminContenedorPage";
import ProximosContenedoresPage from "@/pages/ProximosContenedoresPage";

import OrdersPage from "@/pages/OrdersPage";
import OrdersByIdPage from "@/pages/OrdersByIdPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/categories/*" element={<ShopLayout><CategoriesPage /></ShopLayout>}/>
        <Route path="/cart/*" element={<CartPage/>}/>
        <Route path="/empty" element={<ShopLayout><EmptyPage /></ShopLayout>} />
        <Route path="/category/:category" element={<ShopLayout><CategoryByPage /></ShopLayout>}/>
        <Route path="/homePage/*" element={ <ShopLayout><HomePage /></ShopLayout>}/>
        <Route path="/product/:slug" element={<ShopLayout><ProductPage /></ShopLayout>} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/contenedor/:id" element={<ShopLayout><ContenedorPage /></ShopLayout>} />
        <Route path="/admin/contenedor" element={<ShopLayout><AdminContenedorPage /></ShopLayout>} />
        <Route path="/proximosContenedores" element={<ShopLayout><ProximosContenedoresPage /></ShopLayout>} />
        <Route path="/orders" element={<ShopLayout><OrdersPage /></ShopLayout>} />
        <Route path="/orders/:id" element={<ShopLayout><OrdersByIdPage /></ShopLayout>} />
      </Routes>
    </BrowserRouter>
  );
};
