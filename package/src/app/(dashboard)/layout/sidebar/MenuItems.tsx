import {
  IconLayoutDashboard,
  IconChartBar,
  IconSettings,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "MEDME ASSISTANT",
  },

  {
    id: uniqueId(),
    title: "Main",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Analytics",
    icon: IconChartBar,
    href: "/analytics",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/settings",
  },
  {
    id: uniqueId(),
    title: "Profile",
    icon: IconUser,
    href: "/profile",
  },
  {
    navlabel: true,
    subheader: "ACCOUNT",
  },
  {
    id: uniqueId(),
    title: "Logout",
    icon: IconLogout,
    href: "/logout",
  },

];

export default Menuitems;


