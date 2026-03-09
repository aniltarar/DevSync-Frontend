import AdminLayout from "@/layouts/AdminLayout.vue";

const adminRoutes = [
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "",
        name: "AdminHome",
        component: () => import("@/views/Admin/Home/index.vue"),
      },
    ],
  },
];

export default adminRoutes;
