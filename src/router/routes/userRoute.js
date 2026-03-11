import UserLayout from "@/layouts/UserLayout.vue";

const childMeta = { requiresAuth: true, role: "user" };

const userRoutes = [
  {
    path: "/",
    component: UserLayout,
    children: [
      {
        path: "feed",
        name: "UserHome",
        meta: childMeta,
        component: () => import("@/views/User/Home/index.vue"),
      },
      {
        path: "projects",
        name: "Projects",
        meta: childMeta,
        component: () => import("@/views/User/Projects/index.vue"),
      },
      {
        path: "projects/:projectId",
        name: "ProjectDetail",
        meta: childMeta,
        component: () => import("@/views/User/Projects/Detail/index.vue"),
      },
      {
        path: "messages",
        name: "Messages",
        meta: childMeta,
        component: () => import("@/views/User/Messages/index.vue"),
      },
      {
        path: "notifications",
        name: "Notifications",
        meta: childMeta,
        component: () => import("@/views/User/Notifications/index.vue"),
      },
      {
        path: "applications",
        name: "Applications",
        meta: childMeta,
        component: () => import("@/views/User/Applications/index.vue"),
      },
      {
        path: "profile",
        name: "Profile",
        meta: childMeta,
        component: () => import("@/views/User/Profile/index.vue"),
      },
      {
        path: "settings",
        name: "Settings",
        meta: childMeta,
        component: () => import("@/views/User/Settings/index.vue"),
      },
    ],
  },
];
export default userRoutes;
