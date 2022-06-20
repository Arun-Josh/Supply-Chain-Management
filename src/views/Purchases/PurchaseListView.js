import React from "react";
import CommonHeader from "components/Headers/CommonHeader.js";
import classnames from 'classnames';
import {
    Button
} from "reactstrap"
import { withSnackbar } from "notistack";
import CONSTANTS from "../../variables/general.js";
import DateSearch from "components/Search/DateSearch.js"
import { withStyles } from '@material-ui/core/styles';
const customStyles = {
    CustomStyles: {
        '& td': { backgroundColor: "#FAA", boxShadow: "0 8px 4px 0 rgba(0, 0, 0, 0.2)" }
    },
    NameCell: {
        fontWeight: 900
    },
};

class PurchaseListView extends React.Component {

    state = {
        isSubmitBtnDisabled: false
    }

    disableSubmitButton = (e) => {
        this.setState({ isSubmitBtnDisabled: e })
    }

    generateTableData = (rawData) => {
        const dataTable = []
        rawData.forEach((row) => {

          

            let newRow = [row.date_of_purchase, row.users[0]?row.users[0].user_name:"", row.sub_commodities, row.invoice_no, row.net_total, <Button className="btn-icon btn-2" color="primary" size="sm" type="button" onClick={() => { window.location.href = "/admin/purchase/edit?id=" + row._id }}>
                <span className="btn-inner--icon">
                    <i className="ni ni-scissors" />
                </span>
            </Button >
            ]
            newRow.push()

            dataTable.push(newRow)
        })

        //To Show the most recent tranaction on Top
        dataTable.reverse();

        return dataTable
    }



    render() {
        const columns = [
            {
                name: "Date", label: "Date", options: {
                    filter: false, sort: true, customBodyRender: (value, tableMeta, updateValue) => {

                        return (
                            <div>
                                {value.substring(0, 10)}
                            </div>
                        );
                    }
                }
            },
            {
                name: "Name", label: "Name", options: {
                    filter: true, sort: true
                }
            },
            {
                name: "Particulars", label: "Particulars", options: {
                    filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
                        var i = 0;
                        const items = []

                        for (i = 0; i < value.length; i++) {
                            items.push(<div>{value[i].sub_commodity_name}&nbsp;&nbsp;&nbsp;{value[i].sub_commodity_quantity}</div>)
                        }
                        if (value[0]) {

                            return (
                                <>
                                    <div>{items}</div>

                                </>
                            );
                        }
                        else {
                            return (<>{value}</>)
                        }
                    }
                }
            },
            {
                name: "Invoice Number", label: "Invoice Number", options: {
                    filter: false, sort: false
                }
            },
            {
                name: "Amount", label: "Amount", options: {
                    filter: false, sort: true
                }
            },
            {
                name: "Edit", label: "", options: {
                    filter: false, sort: false, print: false
                }
            }

        ];

        const options = {
            responsive: "scroll",
            selectableRows: false,
            setRowProps: (row) => {
                return {
                    className: classnames(
                        {
                            // [this.props.classes.CustomStyles]: true
                        }),
                    style: {
                        // border: '2px solid black' 
                    }
                };
            },
            setTableProps: () => {
                return {
                    // padding: this.state.denseTable ? "none" : "default",

                    // material ui v4 only
                    // size: this.state.denseTable ? "small" : "medium",
                };
            }

        };

        return (
            <>
                <CommonHeader buttonText="Add Purchase" redirectURL={`/admin/purchase/add`} />

                <DateSearch getUsersLink={`${CONSTANTS.SERVER_URL}/api/suppliers/`} submitLink={`${CONSTANTS.SERVER_URL}/api/purchases/`} columns={columns} generateTableData={this.generateTableData} options={options} isSubmitBtnDisabled={this.state.isSubmitBtnDisabled} disableSubmitButton={this.disableSubmitButton} />
            </>
        )
    }

}


export default withSnackbar(withStyles(customStyles, { name: "PurchaseListView.js" })(PurchaseListView));