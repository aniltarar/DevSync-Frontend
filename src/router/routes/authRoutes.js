import AuthLayout from "@/layouts/AuthLayout.vue";

const authRoutes = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("@/views/Auth/Login/index.vue"),
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/views/Auth/Register/index.vue"),
      },
      {
        path: "verify-email-sent",
        name: "VerifyEmailSent",
        component: () => import("@/views/Auth/VerifyEmailSent/index.vue"),
      },
      {
        path: "verify-email/:token",
        name: "VerifyEmail",
        component: () => import("@/views/Auth/VerifyEmail/index.vue"),
      },
    ],
  },
];

export default authRoutes;
