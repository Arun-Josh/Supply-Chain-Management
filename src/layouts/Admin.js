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
import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";
//Users
import AddConsumer from "views/Consumers/AddConsumer"
import EditConsumer from "views/Consumers/EditConsumer"
import AddSupplier from "views/Suppliers/AddSupplier"
import EditSupplier from "views/Suppliers/EditSupplier"

//commodity
import AddCommodity from "views/Commodities/AddCommodity"
import EditCommodity from "views/Commodities/EditCommodity"

//payment
import AddPayment from "views/Payments/AddPayment"
import EditPayment from "views/Payments/EditPayment"

//expense
import AddExpense from "views/Expenses/AddExpense"
import EditExpense from "views/Expenses/EditExpense"

//income
import AddIncome from "views/Incomes/AddIncome"
import EditIncome from "views/Incomes/EditIncome"

//sales
import AddSales from "views/Sales/AddSales"
import EditSales from "views/Sales/EditSales"

//purchase
import AddPurchase from "views/Purchases/AddPurchase"
import EditPurchase from "views/Purchases/EditPurchase"

//sales return
import AddSalesReturn from "views/SalesReturns/AddSalesReturn"
import EditSalesReturn from "views/SalesReturns/EditSalesReturn"

//purchase return
import AddPurchaseReturn from "views/PurchaseReturns/AddPurchaseReturn"
import EditPurchaseReturn from "views/PurchaseReturns/EditPurchaseReturns"



import routes from "routes.js";
import { SnackbarProvider } from "notistack";
import AdminAccount from "views/AdminAccount/AdminAccount";

class Admin extends React.Component {
  componentDidUpdate(e) {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.mainContent.scrollTop = 0;
  }
  getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  getBrandText = path => {
    for (let i = 0; i < routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          routes[i].layout + routes[i].path
        ) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  render() {
    return (
      <>
        <SnackbarProvider
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          maxSnack={5}
        >
          <Sidebar
            {...this.props}
            routes={routes}
            logo={{
              innerLink: "/admin/index",
              imgSrc: require("assets/img/brand/inv.png"),
              imgAlt: "..."
            }}
          />
          <div className="main-content" ref="mainContent">
            <AdminNavbar
              {...this.props}
              brandText={this.getBrandText(this.props.location.pathname)}
            />
            <Switch>
              <Route
                exact
                path="/admin/account"
                component={AdminAccount}
              />
              <Route
                exact
                path="/admin/consumers/add"
                component={AddConsumer}
              />
              <Route
                exact
                path="/admin/consumers/edit"
                component={EditConsumer}
              />
              <Route
                exact
                path="/admin/suppliers/add"
                component={AddSupplier}
              />
              <Route
                exact
                path="/admin/suppliers/edit"
                component={EditSupplier}
              />
              <Route
                exact
                path="/admin/payments/add"
                component={AddPayment}
              />
              <Route
                exact
                path="/admin/payments/edit"
                component={EditPayment}
              />
              <Route
                exact
                path="/admin/commodities/add"
                component={AddCommodity}
              />
              <Route
                exact
                path="/admin/commodities/edit"
                component={EditCommodity}
              />

              <Route
                exact
                path="/admin/sales/add"
                component={AddSales}
              />
              <Route
                exact
                path="/admin/sales/edit"
                component={EditSales}
              />

              <Route
                exact
                path="/admin/purchase/add"
                component={AddPurchase}
              />
              <Route
                exact
                path="/admin/purchase/edit"
                component={EditPurchase}
              />
              <Route
                exact
                path="/admin/sales-return/add"
                component={AddSalesReturn}
              />
              <Route
                exact
                path="/admin/sales-return/edit"
                component={EditSalesReturn}
              />
              <Route
                exact
                path="/admin/purchase-return/add"
                component={AddPurchaseReturn}
              />
              <Route
                exact
                path="/admin/purchase-return/edit"
                component={EditPurchaseReturn}
              />

              <Route
                exact
                path="/admin/expenses/add"
                component={AddExpense}
              />
              <Route
                exact
                path="/admin/expenses/edit"
                component={EditExpense}
              />
              <Route
                exact
                path="/admin/incomes/add"
                component={AddIncome}
              />
              <Route
                exact
                path="/admin/incomes/edit"
                component={EditIncome}
              />
              {this.getRoutes(routes)}
              <Redirect from="*" to="/admin/index" />
            </Switch>
            <Container fluid>
              <AdminFooter />
            </Container>
          </div>
        </SnackbarProvider>
      </>
    );
  }
}

export default Admin;
