import React from "react";
import CommonHeader from "components/Headers/CommonHeader.js";
import classnames from 'classnames';
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

class StatementsListView extends React.Component {

    state = {
        isSubmitBtnDisabled: false
    }

    disableSubmitButton = (e) => {
        this.setState({ isSubmitBtnDisabled: e })
    }

    generateTableData = (rawData) => {
        const dataTable = []
        rawData.forEach((row) => {

            let newRow = [row.date_of_transaction, row.transaction_type, row.particulars, row.debit, row.credit]
            newRow.push()
            dataTable.push(newRow)
        })

        //To Show the most recent tranaction on Top
        // dataTable.reverse();

        return dataTable
    }

    render() {
        const columns = [
            {
                name: "Date", label: "Date", options: {
                    sort: true, customBodyRender: (value, tableMeta, updateValue) => {

                        return (
                            <div>
                                {value.substring(0, 10)}
                            </div>
                        );
                    }
                }
            },
            {
                name: "Type", label: "Type", options: {
                    filter: true, sort: false
                }
            },
            {
                name: "Particulars", label: "Particulars", options: {
                    filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
                        var i = 0;
                        const items = []

                        for (i = 0; i < value.length; i++) {
                            items.push(<div>{value[i].sub_commodity_name}&nbsp;&nbsp;&nbsp;{value[i].sub_commodity_quantity}&nbsp;&nbsp;&nbsp;{value[i].sub_commodity_price}</div>)
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
                name: "Debit", label: "Debit", options: {
                    sort: true
                }
            },
            {
                name: "Credit", label: "Credit", options: {
                    sort: false
                }
            }

        ];
        const options = {
            responsive: "scroll",
            selectableRows: false,
            print: false,
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
                <CommonHeader />

                <DateSearch getUsersLink={`${CONSTANTS.SERVER_URL}/api/users/`} submitLink={`${CONSTANTS.SERVER_URL}/api/statements/`} columns={columns} generateTableData={this.generateTableData} options={options} isSubmitBtnDisabled={this.state.isSubmitBtnDisabled} disableSubmitButton={this.disableSubmitButton} module="statement" />
            </>
        )
    }

}


export default withSnackbar(withStyles(customStyles, { name: "StatementsListView.js" })(StatementsListView));
