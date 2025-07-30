//src/router/AppRouter.tsx

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
import PromotionsPage from "@/pages/PromotionsPage";

import OrdersPage from "@/pages/OrdersPage";
import OrdersByIdPage from "@/pages/OrdersByIdPage";
import { SearchPage } from "@/pages/SearchPage";
import CheckoutPage from "@/pages/checkout/page";
import UserManagement from "@/pages/admin/UserManagement";

import { OrderConfirmationPage } from '@/pages/orders/[orderId]';
import { PrivateRoute } from "./PrivateRoute";
import UserSalesPerson from '@/pages/salesPerson/UserSalesPerson';



//CheckoutPage

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta pública */}
        <Route path="/" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route path="/categories/*" element={<PrivateRoute><ShopLayout><CategoriesPage /></ShopLayout></PrivateRoute>}/>
        <Route path="/cart/*" element={<PrivateRoute><CartPage/></PrivateRoute>}/>
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage/></PrivateRoute>}/>
        <Route path="/orders/:id" element={<PrivateRoute><OrdersByIdPage/></PrivateRoute>}/>
        <Route path="/empty" element={<PrivateRoute><ShopLayout><EmptyPage /></ShopLayout></PrivateRoute>} />
        <Route path="/category/:category" element={<PrivateRoute><ShopLayout><CategoryByPage /></ShopLayout></PrivateRoute>}/>
        <Route path="/homePage/*" element={ <PrivateRoute><ShopLayout><HomePage /></ShopLayout></PrivateRoute>}/>
        <Route path="/product/:slug" element={<PrivateRoute><ShopLayout><ProductPage /></ShopLayout></PrivateRoute>} />
        <Route path="/404" element={<PrivateRoute><NotFoundPage /></PrivateRoute>} />
        {/* <Route path="/" element={<LoginPage />} /> */}
        <Route path="/contenedor/:id" element={<PrivateRoute><ShopLayout><ContenedorPage /></ShopLayout></PrivateRoute>} />
        <Route path="/admin/contenedor" element={<PrivateRoute><ShopLayout><AdminContenedorPage /></ShopLayout></PrivateRoute>} />
        <Route path="/proximosContenedores" element={<PrivateRoute><ShopLayout><ProximosContenedoresPage /></ShopLayout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><ShopLayout><OrdersPage /></ShopLayout></PrivateRoute>} />

        <Route path="/admin/user-management" element={<PrivateRoute><ShopLayout><UserManagement /></ShopLayout></PrivateRoute>} />
        <Route path="/salesPerson/user-salesPerson" element={<PrivateRoute><ShopLayout><UserSalesPerson/></ShopLayout></PrivateRoute>} />
        
        <Route path="/orders/:id" element={<PrivateRoute><ShopLayout><OrdersByIdPage /></ShopLayout></PrivateRoute>} />
        <Route path="/promociones" element={<PrivateRoute><ShopLayout><PromotionsPage /></ShopLayout></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><ShopLayout><SearchPage /></ShopLayout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
};
