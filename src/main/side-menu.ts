import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Dashboard",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/",
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
        pathname: "/users-layout-1",
        title: "Employers",
      },
      {
        icon: "Activity",
        pathname: "/users-layout-3",
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
            pathname: "/product-list",
            title: "Pending withdrawals",
          },
          {
            icon: "Zap",
            pathname: "/product-grid",
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
            pathname: "/transaction-list",
            title: "Transaction List",
          },
          {
            icon: "Zap",
            pathname: "/transaction-detail",
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
            pathname: "/seller-list",
            title: "Job List",
          },
        ],
      },
    ],
  },
  {
    icon: "MessageSquare",
    pathname: "/chat",
    title: "Chat",
  },
  {
    icon: "Calendar",
    pathname: "/calendar",
    title: "Calendar",
  },
  "divider",
  {
    icon: "FilePenLine",
    title: "Reports",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/crud-data-list",
        title: "Disputes",
      },
      {
        icon: "Activity",
        pathname: "/crud-form",
        title: "Fraud Reports",
      },
    ],
  },
 
  {
    icon: "Trello",
    title: "Profile",
    subMenu: [
      {
        icon: "Activity",
        pathname: "/profile-overview-3",
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
        pathname: "/update-profile",
        title: "Update profile",
      },
      {
        icon: "Activity",
        pathname: "/change-password",
        title: "Change Password",
      },
    ],
  },
  "divider",
  
];

export default menu;