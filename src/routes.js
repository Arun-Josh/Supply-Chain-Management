/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Register from "views/examples/Register.js";
// import Profile from "views/examples/Profile.js";
// import Maps from "views/examples/Maps.js";
// import Login from "views/examples/Login.js";
// import Tables from "views/examples/Tables.js";
// import Icons from "views/examples/Icons.js";
import Payment from "views/Payments/PaymentsListView"
import Consumers from "views/Consumers/ConsumersListView"
import Suppliers from "views/Suppliers/SuppliersListView"
import Commodities from "views/Commodities/CommoditiesListView";
import Expenses from "views/Expenses/ExpensesListView"
import Incomes from "views/Incomes/IncomeListView"
import Sales from "views/Sales/SalesListView";
import Purchase from "views/Purchases/PurchaseListView";
import SalesReturn from "views/SalesReturns/SalesReturnsListView";
import PurchaseReturn from "views/PurchaseReturns/PurchaseReturnsListView";
import Statement from "views/Statement/Statement";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin"
  },
  {
    path: "/commodities",
    name: "Commodity",
    icon: "ni ni-app   text-red",
    component: Commodities,
    layout: "/admin"
  },
  {
    path: "/suppliers",
    name: "Suppliers",
    icon: "ni ni-shop text-blue",
    component: Suppliers,
    layout: "/admin"
  },
  // {
  //   path: "/transactions",
  //   name: "Transaction",
  //   icon: "ni ni-money-coins text-orange",
  //   component: AddTransaction,
  //   layout: "/admin"
  // },
  {
    path: "/consumers",
    name: "Consumers",
    icon: "ni ni-badge text-red",
    component: Consumers,
    layout: "/admin"
  },
 
  {
    path: "/purchase",
    name: "Purchase",
    icon: "ni ni-cart text-yellow",
    component: Purchase,
    layout: "/admin"
  },
  {
    path: "/sales",
    name: "Sales",
    icon: "ni ni-spaceship text-pink",
    component: Sales,
    layout: "/admin"
  },
  {
    path: "/purchase-return",
    name: "Purchase Return",
    icon: "ni ni-cart text-red",
    component: PurchaseReturn,
    layout: "/admin"
  },
  {
    path: "/sales-return",
    name: "Sales Return",
    icon: "ni ni-delivery-fast text-green",
    component: SalesReturn,
    layout: "/admin"
  },
   
  {
    path: "/payments",
    name: "Payment",
    icon: "ni ni-money-coins text-green",
    component: Payment,
    layout: "/admin"
  },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: Icons,
  //   layout: "/admin"
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: Maps,
  //   layout: "/admin"
  // },
  // {
  //   path: "/user-profile",
  //   name: "User Profile",
  //   icon: "ni ni-single-02 text-yellow",
  //   component: Profile,
  //   layout: "/admin"
  // },
  // {
  //   path: "/tables",
  //   name: "Tables",
  //   icon: "ni ni-bullet-list-67 text-red",
  //   component: Tables,
  //   layout: "/admin"
  // },
  // {
  //   path: "/login",
  //   name: "Login",
  //   icon: "ni ni-key-25 text-info",
  //   component: Login,
  //   layout: "/auth"
  // },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: Register,
  //   layout: "/auth"
  // },
  // {
  //   path: "/receipt",
  //   name: "Receipt",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: Register,
  //   layout: "/admin"
  // },
 

 
  {
    path: "/expenses",
    name: "Expense",
    icon: "ni ni-money-coins text-red",
    component: Expenses,
    layout: "/admin"
  },
  {
    path: "/income",
    name: "Income",
    icon: "ni ni-money-coins text-green",
    component: Incomes,
    layout: "/admin"
  },
  {
    path: "/statement",
    name: "Statement",
    icon: "ni ni-collection text-green",
    component: Statement,
    layout: "/admin"
  }
];
export default routes;
