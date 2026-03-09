import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "@/router/routes/authRoutes.js";
import adminRoutes from "@/router/routes/adminRoutes";
import userRoutes from "@/router/routes/userRoute.js";
import { useAuthStore } from "@/stores/auth";

const routes = [...authRoutes, ...adminRoutes, ...userRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const user = authStore.user;

  // Giriş yapmış kullanıcı auth sayfalarına erişemesin
  if (to.meta.guestOnly && user) {
    return next(user.role === "admin" ? "/admin" : "/");
  }

  // Giriş gerektiren sayfa
  if (to.meta.requiresAuth && !user) {
    return next("/auth/login");
  }

  // Admin sayfasına sadece admin girebilir
  if (to.meta.role === "admin" && user?.role !== "admin") {
    return next("/");
  }

  // User sayfasına sadece user veya admin girebilir
  if (to.meta.role === "user" && user && user.role !== "user" && user.role !== "admin") {
    return next("/");
  }

  next();
});

export default router;
