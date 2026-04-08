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
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/views/Admin/Users/index.vue"),
      },
      {
        path: "reports",
        name: "AdminReports",
        component: () => import("@/views/Admin/Reports/index.vue"),
      },
      {
        path: "posts",
        name: "AdminPosts",
        component: () => import("@/views/Admin/Posts/index.vue"),
      },
      {
        path: "projects",
        name: "AdminProjects",
        component: () => import("@/views/Admin/Projects/index.vue"),
      },
      {
        path: "comments",
        name: "AdminComments",
        component: () => import("@/views/Admin/Comments/index.vue"),
      },
    ],
  },
];

export default adminRoutes;
