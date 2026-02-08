import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Dashboard",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/admin/dashboard",
        title: "Overview 1",
      },
    ],
  },
   {
    icon: "Users",
    title: "Users",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/admin/users-layout-1",
        title: "Employers",
      },
      {
        icon: "Activity",
        pathname: "/admin/users-layout-3",
        title: "Freelancers",
      },
    ],
  },
  {
    icon: "ShoppingBag",
    title: "Finance",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/products",
        title: "Pending Transactions",
        subMenu: [
          {
            icon: "Zap",
            pathname: "/admin/product-list",
            title: "Pending withdrawals",
          },
          {
            icon: "Zap",
            pathname: "/admin/product-grid",
            title: "Pending Deposits",
          },
        ],
      },
      {
        icon: "Activity",
        pathname: "/transactions",
        title: "Transactions",
        subMenu: [
          {
            icon: "Zap",
            pathname: "/admin/transaction-list",
            title: "Transaction List",
          },
          {
            icon: "Zap",
            pathname: "/admin/transaction-detail",
            title: "Transaction Detail",
          },
        ],
      },
      {
        icon: "Activity",
        pathname: "/sellers",
        title: "All Jobs",
        subMenu: [
          {
            icon: "Zap",
            pathname: "/admin/seller-list",
            title: "Job List",
          },
        ],
      },
    ],
  },
  {
    icon: "MessageSquare",
    pathname: "/admin/chat",
    title: "Chat",
  },
  {
    icon: "Calendar",
    pathname: "/admin/calendar",
    title: "Calendar",
  },
  "divider",
  {
    icon: "FilePenLine",
    title: "Reports",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/admin/crud-data-list",
        title: "Disputes",
      },
    ],
  },
 
  {
    icon: "Trello",
    title: "Profile",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/admin/profile-overview-3",
        title: "User Edits",
      },
    ],
  },
  {
    icon: "PanelsTopLeft",
    title: "Pages",
    subMenu: [
      {
        icon: "Activity",
        pathname: "login",
        title: "Login",
      },
      {
        icon: "Activity",
        pathname: "register",
        title: "Register",
      },
      {
        icon: "Activity",
        pathname: "/admin/update-profile",
        title: "Update profile",
      },
      {
        icon: "Activity",
        pathname: "/admin/change-password",
        title: "Change Password",
      },
    ],
  },
  "divider",
  
];

export default menu;