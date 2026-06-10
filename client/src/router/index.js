import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/cwl",
    name: "CwlReport",
    component: () => import("@/views/cwl-report/CwlReport.vue"),
  },
  {
    path: "/clan",
    name: "ClanReport",
    component: () => import("@/views/ClanReport.vue"),
  },
  {
    path: "/glory",
    name: "GloryReport",
    component: () => import("@/views/glory-report/GloryReport.vue"),
  },
  {
    path: "/shame",
    name: "ShameReport",
    component: () => import("@/views/ShameReport.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
