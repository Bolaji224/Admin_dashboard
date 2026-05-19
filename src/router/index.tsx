import { useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load all pages — they only download when the user visits that page
const DashboardOverview1 = lazy(() => import("../pages/DashboardOverview1"));
const DashboardOverview2 = lazy(() => import("../pages/DashboardOverview2"));
const DashboardOverview3 = lazy(() => import("../pages/DashboardOverview3"));
const DashboardOverview4 = lazy(() => import("../pages/DashboardOverview4"));
const Categories = lazy(() => import("../pages/Categories"));
const AddProduct = lazy(() => import("../pages/AddProduct"));
const ProductList = lazy(() => import("../pages/ProductList"));
const ProductGrid = lazy(() => import("../pages/ProductGrid"));
const TransactionList = lazy(() => import("../pages/TransactionList"));
const TransactionDetail = lazy(() => import("../pages/TransactionDetail"));
const SellerList = lazy(() => import("../pages/SellerList"));
const SellerDetail = lazy(() => import("../pages/SellerDetail"));
const Reviews = lazy(() => import("../pages/Reviews"));
const Inbox = lazy(() => import("../pages/Inbox"));
const FileManager = lazy(() => import("../pages/FileManager"));
const PointOfSale = lazy(() => import("../pages/PointOfSale"));
const Chat = lazy(() => import("../pages/Chat"));
const Post = lazy(() => import("../pages/Post"));
const Calendar = lazy(() => import("../pages/Calendar"));
const CrudDataList = lazy(() => import("../pages/CrudDataList"));
const CrudForm = lazy(() => import("../pages/CrudForm"));
const UsersLayout1 = lazy(() => import("../pages/UsersLayout1"));
const UsersLayout2 = lazy(() => import("../pages/UsersLayout2"));
const UsersLayout3 = lazy(() => import("../pages/UsersLayout3"));
const ProfileOverview1 = lazy(() => import("../pages/ProfileOverview1"));
const ProfileOverview2 = lazy(() => import("../pages/ProfileOverview2"));
const ProfileOverview3 = lazy(() => import("../pages/ProfileOverview3"));
const WizardLayout1 = lazy(() => import("../pages/WizardLayout1"));
const WizardLayout2 = lazy(() => import("../pages/WizardLayout2"));
const WizardLayout3 = lazy(() => import("../pages/WizardLayout3"));
const BlogLayout1 = lazy(() => import("../pages/BlogLayout1"));
const BlogLayout2 = lazy(() => import("../pages/BlogLayout2"));
const BlogLayout3 = lazy(() => import("../pages/BlogLayout3"));
const PricingLayout1 = lazy(() => import("../pages/PricingLayout1"));
const PricingLayout2 = lazy(() => import("../pages/PricingLayout2"));
const InvoiceLayout1 = lazy(() => import("../pages/InvoiceLayout1"));
const InvoiceLayout2 = lazy(() => import("../pages/InvoiceLayout2"));
const FaqLayout1 = lazy(() => import("../pages/FaqLayout1"));
const FaqLayout2 = lazy(() => import("../pages/FaqLayout2"));
const FaqLayout3 = lazy(() => import("../pages/FaqLayout3"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));
const UpdateProfile = lazy(() => import("../pages/UpdateProfile"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const RegularTable = lazy(() => import("../pages/RegularTable"));
const Tabulator = lazy(() => import("../pages/Tabulator"));
const Modal = lazy(() => import("../pages/Modal"));
const Slideover = lazy(() => import("../pages/Slideover"));
const Notification = lazy(() => import("../pages/Notification"));
const Tab = lazy(() => import("../pages/Tab"));
const Accordion = lazy(() => import("../pages/Accordion"));
const Button = lazy(() => import("../pages/Button"));
const Alert = lazy(() => import("../pages/Alert"));
const ProgressBar = lazy(() => import("../pages/ProgressBar"));
const Tooltip = lazy(() => import("../pages/Tooltip"));
const Dropdown = lazy(() => import("../pages/Dropdown"));
const Typography = lazy(() => import("../pages/Typography"));
const Icon = lazy(() => import("../pages/Icon"));
const LoadingIcon = lazy(() => import("../pages/LoadingIcon"));
const RegularForm = lazy(() => import("../pages/RegularForm"));
const Datepicker = lazy(() => import("../pages/Datepicker"));
const TomSelect = lazy(() => import("../pages/TomSelect"));
const FileUpload = lazy(() => import("../pages/FileUpload"));
const WysiwygEditor = lazy(() => import("../pages/WysiwygEditor"));
const Validation = lazy(() => import("../pages/Validation"));
const Chart = lazy(() => import("../pages/Chart"));
const Slider = lazy(() => import("../pages/Slider"));
const ImageZoom = lazy(() => import("../pages/ImageZoom"));

import Layout from "../themes";
import ProtectedAdminRoute from "@/components/Admin/ProtectedAdminRoute";

// Simple loading spinner shown while a page is being fetched
function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function Router() {
  const routes = [
    {
      path: "/admin/login",
      element: (
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: "/admin",
      element: <ProtectedAdminRoute />,
      children: [
        {
          path: "",
          element: <Layout />,
          children: [
            {
              path: "dashboard",
              element: <Suspense fallback={<PageLoader />}><DashboardOverview1 /></Suspense>,
            },
            {
              path: "dashboard-overview-2",
              element: <Suspense fallback={<PageLoader />}><DashboardOverview2 /></Suspense>,
            },
            {
              path: "dashboard-overview-3",
              element: <Suspense fallback={<PageLoader />}><DashboardOverview3 /></Suspense>,
            },
            {
              path: "dashboard-overview-4",
              element: <Suspense fallback={<PageLoader />}><DashboardOverview4 /></Suspense>,
            },
            {
              path: "categories",
              element: <Suspense fallback={<PageLoader />}><Categories /></Suspense>,
            },
            {
              path: "add-product",
              element: <Suspense fallback={<PageLoader />}><AddProduct /></Suspense>,
            },
            {
              path: "product-list",
              element: <Suspense fallback={<PageLoader />}><ProductList /></Suspense>,
            },
            {
              path: "product-grid",
              element: <Suspense fallback={<PageLoader />}><ProductGrid /></Suspense>,
            },
            {
              path: "transaction-list",
              element: <Suspense fallback={<PageLoader />}><TransactionList /></Suspense>,
            },
            {
              path: "transaction-detail",
              element: <Suspense fallback={<PageLoader />}><TransactionDetail /></Suspense>,
            },
            {
              path: "seller-list",
              element: <Suspense fallback={<PageLoader />}><SellerList /></Suspense>,
            },
            {
              path: "seller-detail",
              element: <Suspense fallback={<PageLoader />}><SellerDetail /></Suspense>,
            },
            {
              path: "reviews",
              element: <Suspense fallback={<PageLoader />}><Reviews /></Suspense>,
            },
            {
              path: "inbox",
              element: <Suspense fallback={<PageLoader />}><Inbox /></Suspense>,
            },
            {
              path: "file-manager",
              element: <Suspense fallback={<PageLoader />}><FileManager /></Suspense>,
            },
            {
              path: "point-of-sale",
              element: <Suspense fallback={<PageLoader />}><PointOfSale /></Suspense>,
            },
            {
              path: "chat",
              element: <Suspense fallback={<PageLoader />}><Chat /></Suspense>,
            },
            {
              path: "post",
              element: <Suspense fallback={<PageLoader />}><Post /></Suspense>,
            },
            {
              path: "calendar",
              element: <Suspense fallback={<PageLoader />}><Calendar /></Suspense>,
            },
            {
              path: "crud-data-list",
              element: <Suspense fallback={<PageLoader />}><CrudDataList /></Suspense>,
            },
            {
              path: "crud-form",
              element: <Suspense fallback={<PageLoader />}><CrudForm /></Suspense>,
            },
            {
              path: "users-layout-1",
              element: <Suspense fallback={<PageLoader />}><UsersLayout1 /></Suspense>,
            },
            {
              path: "users-layout-2",
              element: <Suspense fallback={<PageLoader />}><UsersLayout2 /></Suspense>,
            },
            {
              path: "users-layout-3",
              element: <Suspense fallback={<PageLoader />}><UsersLayout3 /></Suspense>,
            },
            {
              path: "profile-overview-1",
              element: <Suspense fallback={<PageLoader />}><ProfileOverview1 /></Suspense>,
            },
            {
              path: "profile-overview-2",
              element: <Suspense fallback={<PageLoader />}><ProfileOverview2 /></Suspense>,
            },
            {
              path: "profile-overview-3",
              element: <Suspense fallback={<PageLoader />}><ProfileOverview3 /></Suspense>,
            },
            {
  path: "profile-overview-3/:id",
  element: <Suspense fallback={<PageLoader />}><ProfileOverview3 /></Suspense>,
},
            {
              path: "wizard-layout-1",
              element: <Suspense fallback={<PageLoader />}><WizardLayout1 /></Suspense>,
            },
            {
              path: "wizard-layout-2",
              element: <Suspense fallback={<PageLoader />}><WizardLayout2 /></Suspense>,
            },
            {
              path: "wizard-layout-3",
              element: <Suspense fallback={<PageLoader />}><WizardLayout3 /></Suspense>,
            },
            {
              path: "blog-layout-1",
              element: <Suspense fallback={<PageLoader />}><BlogLayout1 /></Suspense>,
            },
            {
              path: "blog-layout-2",
              element: <Suspense fallback={<PageLoader />}><BlogLayout2 /></Suspense>,
            },
            {
              path: "blog-layout-3",
              element: <Suspense fallback={<PageLoader />}><BlogLayout3 /></Suspense>,
            },
            {
              path: "pricing-layout-1",
              element: <Suspense fallback={<PageLoader />}><PricingLayout1 /></Suspense>,
            },
            {
              path: "pricing-layout-2",
              element: <Suspense fallback={<PageLoader />}><PricingLayout2 /></Suspense>,
            },
            {
              path: "invoice-layout-1",
              element: <Suspense fallback={<PageLoader />}><InvoiceLayout1 /></Suspense>,
            },
            {
              path: "invoice-layout-2",
              element: <Suspense fallback={<PageLoader />}><InvoiceLayout2 /></Suspense>,
            },
            {
              path: "faq-layout-1",
              element: <Suspense fallback={<PageLoader />}><FaqLayout1 /></Suspense>,
            },
            {
              path: "faq-layout-2",
              element: <Suspense fallback={<PageLoader />}><FaqLayout2 /></Suspense>,
            },
            {
              path: "faq-layout-3",
              element: <Suspense fallback={<PageLoader />}><FaqLayout3 /></Suspense>,
            },
            {
              path: "update-profile",
              element: <Suspense fallback={<PageLoader />}><UpdateProfile /></Suspense>,
            },
            {
              path: "change-password",
              element: <Suspense fallback={<PageLoader />}><ChangePassword /></Suspense>,
            },
            {
              path: "regular-table",
              element: <Suspense fallback={<PageLoader />}><RegularTable /></Suspense>,
            },
            {
              path: "tabulator",
              element: <Suspense fallback={<PageLoader />}><Tabulator /></Suspense>,
            },
            {
              path: "modal",
              element: <Suspense fallback={<PageLoader />}><Modal /></Suspense>,
            },
            {
              path: "slideover",
              element: <Suspense fallback={<PageLoader />}><Slideover /></Suspense>,
            },
            {
              path: "notification",
              element: <Suspense fallback={<PageLoader />}><Notification /></Suspense>,
            },
            {
              path: "tab",
              element: <Suspense fallback={<PageLoader />}><Tab /></Suspense>,
            },
            {
              path: "accordion",
              element: <Suspense fallback={<PageLoader />}><Accordion /></Suspense>,
            },
            {
              path: "button",
              element: <Suspense fallback={<PageLoader />}><Button /></Suspense>,
            },
            {
              path: "alert",
              element: <Suspense fallback={<PageLoader />}><Alert /></Suspense>,
            },
            {
              path: "progress-bar",
              element: <Suspense fallback={<PageLoader />}><ProgressBar /></Suspense>,
            },
            {
              path: "tooltip",
              element: <Suspense fallback={<PageLoader />}><Tooltip /></Suspense>,
            },
            {
              path: "dropdown",
              element: <Suspense fallback={<PageLoader />}><Dropdown /></Suspense>,
            },
            {
              path: "typography",
              element: <Suspense fallback={<PageLoader />}><Typography /></Suspense>,
            },
            {
              path: "icon",
              element: <Suspense fallback={<PageLoader />}><Icon /></Suspense>,
            },
            {
              path: "loading-icon",
              element: <Suspense fallback={<PageLoader />}><LoadingIcon /></Suspense>,
            },
            {
              path: "regular-form",
              element: <Suspense fallback={<PageLoader />}><RegularForm /></Suspense>,
            },
            {
              path: "datepicker",
              element: <Suspense fallback={<PageLoader />}><Datepicker /></Suspense>,
            },
            {
              path: "tom-select",
              element: <Suspense fallback={<PageLoader />}><TomSelect /></Suspense>,
            },
            {
              path: "file-upload",
              element: <Suspense fallback={<PageLoader />}><FileUpload /></Suspense>,
            },
            {
              path: "wysiwyg-editor",
              element: <Suspense fallback={<PageLoader />}><WysiwygEditor /></Suspense>,
            },
            {
              path: "validation",
              element: <Suspense fallback={<PageLoader />}><Validation /></Suspense>,
            },
            {
              path: "chart",
              element: <Suspense fallback={<PageLoader />}><Chart /></Suspense>,
            },
            {
              path: "slider",
              element: <Suspense fallback={<PageLoader />}><Slider /></Suspense>,
            },
            {
              path: "image-zoom",
              element: <Suspense fallback={<PageLoader />}><ImageZoom /></Suspense>,
            },
          ],
        },
      ],
    },
    {
      path: "/register",
      element: (
        <Suspense fallback={<PageLoader />}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: "/error-page",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ErrorPage />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ErrorPage />
        </Suspense>
      ),
    },
  ];

  return useRoutes(routes);
}

export default Router;