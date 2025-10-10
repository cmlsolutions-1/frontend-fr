//src/router/AppRouter.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import { ShopLayout } from "@/layouts/ShopLayout";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryByPage } from "@/pages/CategoryByPage";
import { CartPage } from "@/pages/cart/CartPage";
import { EmptyPage } from "@/pages/cart/empty/page";
import { ProductPage } from "@/pages/product/ProductPage";
import { NotFoundPage } from "@/pages/not-found";
import ContenedorPage from "@/pages/ContenedorPage";
import AdminContenedorPage from "@/pages/AdminContenedorPage";
import ProximosContenedoresPage from "@/pages/ProximosContenedoresPage";
import PromotionsPage from "@/pages/PromotionsPage";

import OrdersPage from "@/pages/OrdersPage";
import OrdersPageAdmin from "@/pages/admin/OrdersPageAdmin";
import OrdersByIdPage from "@/pages/OrdersByIdPage";
import { SearchPage } from "@/pages/SearchPage";
import CheckoutPage from "@/pages/checkout/page";
import UserManagement from "@/pages/admin/UserManagement";

import { OrderConfirmationPage } from "@/pages/orders/[orderId]";
import { PrivateRoute } from "./PrivateRoute";
import UserSalesPerson from "@/pages/salesPerson/UserSalesPerson";
import { useAuthStore } from "@/store/auth-store";
import OrdersPageSalesPerson from "@/pages/salesPerson/OrdersPageSalesPerson";
import ListPromotionsClients from "@/pages/ListPromotionsClients";

import { RoleProtectedRoute } from "./RoleProtectedRoute";


//CheckoutPage

export const AppRouter = () => {
  const { user } = useAuthStore();
  console.log(" user en AppRoutes:", user);
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<LoginPage />} />

        {/* Rutas Admin */}
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <ShopLayout>
                  <OrdersPageAdmin />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/user-management"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <ShopLayout>
                  <UserManagement />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/promociones"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <ShopLayout>
                  <PromotionsPage />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        {/* Rutas SalesPerson */}
        <Route
          path="/salesPerson/user-salesPerson"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["SalesPerson"]}>
                <ShopLayout>
                  <UserSalesPerson currentSellerId={user?._id ?? ""} />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/salesPerson/orders"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["SalesPerson"]}>
                <ShopLayout>
                  <OrdersPageSalesPerson />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        {/* Rutas Client */}

        <Route
            path="/cart/*"
            element={
            <RoleProtectedRoute allowedRoles={["Client"]}>
              <CartPage />
            </RoleProtectedRoute>
                  }
                />

                <Route  
                      path="/checkout"
                          element={
                            <RoleProtectedRoute allowedRoles={["Client"]}>
                              <CheckoutPage />
                            </RoleProtectedRoute>
                          }
                        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["Client"]}>
                <ShopLayout>
                  <OrdersPage />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/promocionesActivas"
          element={
            <PrivateRoute>
              <RoleProtectedRoute allowedRoles={["Client","SalesPerson"]}>
                <ShopLayout>
                  <ListPromotionsClients />
                </ShopLayout>
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />

        {/* Rutas Publicas */}

        <Route
          path="/homePage/*"
          element={
            <PrivateRoute>
              <ShopLayout>
                <HomePage />
              </ShopLayout>
            </PrivateRoute>
          }
        />

        <Route
            path="/product/:_id"
                  element={
                <PrivateRoute>
                <ShopLayout>
                <ProductPage />
                </ShopLayout>
              </PrivateRoute>
            }
          />
          <Route
                    path="/orders/:_id"
                    element={
                      <PrivateRoute>
                        <OrdersByIdPage />
                      </PrivateRoute>
                    }
                  />       

        <Route
          path="/empty"
          element={
            <PrivateRoute>
              <ShopLayout>
                <EmptyPage />
              </ShopLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/404"
          element={
            <PrivateRoute>
              <NotFoundPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <ShopLayout>
                <SearchPage />
              </ShopLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
