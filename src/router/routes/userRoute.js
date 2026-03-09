import UserLayout from "@/layouts/UserLayout.vue";

const userRoutes = [
  {
    path: "",
    component: UserLayout,
    meta: { requiresAuth: true, role: "user" },
    children: [
      {
        path: "",
        name: "UserHome",
        component: () => import("@/views/User/Home/index.vue"),
      },
    ],
  },
];
export default userRoutes;
