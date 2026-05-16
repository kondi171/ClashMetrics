import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Używamy tylko ikon dostępnych w darmowej paczce @fortawesome/free-solid-svg-icons
import {
  faHome,
  faSliders,
  faKhanda,
  faCrosshairs, // Zamiast faSwords (darmowy odpowiednik ataku/celu)
  faShieldHalved,
  faStar,
  faCrown,
  faBarsStaggered,
  faPercentage,
  faCalendarDays,
  faTrophy,
  faMicroscope,
  faArrowDownWideShort,
  faCalendarCheck,
  faUsers,
  faRotateRight,
  faCircleExclamation,
  faMagnifyingGlass,
  faArrowLeft,
  faAward,
  faCircleQuestion,
  faFileExcel,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";

import "@/assets/scss/main.scss";

library.add(
  faHome,
  faSliders,
  faShieldHalved,
  faCrown,
  faKhanda,
  faBarsStaggered,
  faMicroscope,
  faArrowDownWideShort,
  faCalendarCheck,
  faCrosshairs,
  faStar,
  faPercentage,
  faCalendarDays,
  faTrophy,
  faUsers,
  faRotateRight,
  faCircleExclamation,
  faMagnifyingGlass,
  faArrowLeft,
  faAward,
  faCircleQuestion,
  faFileExcel,
  faArrowsLeftRight,
);

const app = createApp(App);

// Rejestracja komponentu
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.mount("#app");
