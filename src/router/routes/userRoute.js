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
        path: "posts/:postId",
        name: "PostDetail",
        meta: childMeta,
        component: () => import("@/views/User/Home/Detail/index.vue"),
      },
      {
        path: "projects",
        name: "Projects",
        meta: childMeta,
        component: () => import("@/views/User/Projects/index.vue"),
      },
      {
        path: "projects/create",
        name: "CreateProject",
        meta: childMeta,
        component: () => import("@/views/User/Projects/Create/index.vue"),
      },
      {
        path: "my-projects",
        name: "MyProjects",
        meta: childMeta,
        component: () => import("@/views/User/Projects/MyProjects/index.vue"),
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
        path: "projects/:projectId/applications",
        name: "ProjectApplications",
        meta: childMeta,
        component: () =>
          import(
            "@/views/User/Applications/ProjectApplications/index.vue"
          ),
      },
      {
        path: "search",
        name: "SearchUsers",
        meta: childMeta,
        component: () => import("@/views/User/Search/index.vue"),
      },
      {
        path: "my-profile",
        name: "Profile",
        meta: childMeta,
        component: () => import("@/views/User/Profiles/My-Profile/index.vue"),
      },
      {
        path: "profile/:userId",
        name: "UserProfile",
        meta: childMeta,
        component: () => import("@/views/User/Profiles/Profile/index.vue"),
      },
      {
        path: "reports",
        name: "Reports",
        meta: childMeta,
        component: () => import("@/views/User/Reports/index.vue"),
      },
      {
        path: "reports/:reportId",
        name: "ReportDetail",
        meta: childMeta,
        component: () => import("@/views/User/Reports/Detail/index.vue"),
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
