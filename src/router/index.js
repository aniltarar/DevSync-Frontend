import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "@/router/routes/authRoutes.js";
import adminRoutes from "@/router/routes/adminRoutes";
import userRoutes from "@/router/routes/userRoute.js";
import { useAuthStore } from "@/stores/auth";

const landingRoute = {
  path: "/",
  name: "Landing",
  component: () => import("@/views/Landing/index.vue"),
};

const routes = [landingRoute, ...authRoutes, ...adminRoutes, ...userRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const user = authStore.user;

  // Landing sayfasına giriş yapmış kullanıcı gelirse feed'e yönlendir
  if (to.name === "Landing" && user) {
    return next(user.role === "admin" ? "/admin" : "/feed");
  }

  // Giriş yapmış kullanıcı auth sayfalarına erişemesin
  if (to.meta.guestOnly && user) {
    return next(user.role === "admin" ? "/admin" : "/feed");
  }

  // Giriş gerektiren sayfa → landing'e yönlendir
  if (to.meta.requiresAuth && !user) {
    return next("/");
  }

  // Admin sayfasına sadece admin girebilir
  if (to.meta.role === "admin" && user?.role !== "admin") {
    return next("/feed");
  }

  // User sayfasına sadece user veya admin girebilir
  if (to.meta.role === "user" && user && user.role !== "user" && user.role !== "admin") {
    return next("/feed");
  }

  next();
});

export default router;
