import React from "react"
import MUIDataTable from "mui-datatables";
import {
    Button,
    Col,
    Row,
    Card,
    CardHeader,
    CardBody
} from "reactstrap";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import Axios from "axios";
import { withSnackbar } from "notistack";
import CONSTANTS from "../../variables/general.js"
import CommonHeader from "../../components/Headers/CommonHeader.js";
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

const customStyles = {
    CustomStyles: {
        '& td': { backgroundColor: "#FAA", boxShadow: "0 8px 4px 0 rgba(0, 0, 0, 0.2)" }
    },
    NameCell: {
        fontWeight: 900
    },
};

class ConsumersListView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            consumers: []
        };
    }

    componentDidMount() {

        this.getData()
    }

    getData() {

        Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/`, {

        }
        )
            .then(res => {


                let consumers = [];

                res.data.forEach(trans => {
                    consumers.push(trans)
                })

                this.setState({ consumers })


            })
            .catch(err => {
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
            })
    }

    getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTable: {
                root: {
                    // boxShadow: "grey"
                },
                paper: {
                    // width: '100%'
                }
            },
            MUIDataTableBodyCell: {
                root: {
                    // backgroundColor: "#FFF"
                }
            }
        }
    });

    generateTableData = (rawData) => {
        const dataTable = []
        rawData.forEach((row) => {

            let newRow = [row.user_name, row.address + "*" + row.district, row.phone, row.email_id, row.account_no, row.balance, <Button className="btn-icon btn-2" color="primary" size="sm" type="button" onClick={() => { window.location.href = "/admin/consumers/edit?id=" + row._id }}>
                <span className="btn-inner--icon">
                <i className="ni ni-scissors" />
                </span>
            </Button >
                ,
                <Button className="btn-icon btn-2 btn-danger" size="sm" color="primary" type="button" onClick={() => { this.handleDelete(row._id) }}>
                    <span className="btn-inner--icon">
                        ----{/* <i className="ni ni-fat-remove " /> */}
                    </span>
                </Button>
            ]
            newRow.push()

            dataTable.push(newRow)
        })

        //To Show the most recent tranaction on Top
        dataTable.reverse();

        return dataTable
    }


    handleDelete = (props) => {

        Axios.delete(`${CONSTANTS.SERVER_URL}/api/consumers/` + props)
            .then(response => {
                this.props.enqueueSnackbar(
                    "Consumer Deleted",
                    {
                        variant: "success"
                    })
            }).then(this.getData());

    }

    render() {
        const columns = [
            {
                name: "Name", label: "Name", options: {
                    filter: true, sort: true, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            },
            {
                name: "Address", label: "Address", options: {
                    filter: true, sort: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        }), customBodyRender: (value, tableMeta, updateValue) => {
                            var address = value.split('*');
                            return (
                                <div>
                                    <div>{address[0]}</div>
                                    <div>{address[1]}</div>
                                </div>
                            );
                        }
                }
            },
            {
                name: "Phone", label: "Phone", options: {
                    filter: true, sort: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            },
            {
                name: "Email-Id", label: "Email-Id", options: {
                    filter: true, sort: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            },
            {
                name: "Account Number", label: "Account Number", options: {
                    filter: true, sort: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            },
            {
                name: "Balance", label: "Balance", options: {
                    filter: true, sort: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            },
            {
                name: "Edit", label: "", options: {
                    filter: false, sort: false, print: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
                }
            }
            ,
            {
                name: "Delete", label: "", options: {
                    filter: false, sort: false, print: false, className: classnames(
                        {
                            [this.props.classes.NameCell]: true
                        })
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
                <CommonHeader buttonText="Register Consumer" redirectURL={`/admin/consumers/add`} />
                <Col className=" mt--7 order-xl-1" xl="12">
                    <Card className="bg-secondary shadow">
                        <CardHeader className="bg-white border-0">
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <h3 className="mb-0">Consumers</h3>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            {/* MUI DATATABLE */}
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <MuiThemeProvider theme={this.getMuiTheme()}>

                                        <MUIDataTable title={""} data={this.generateTableData(this.state.consumers)} columns={columns} options={options} />
                                    </MuiThemeProvider>
                                </GridItem>
                            </GridContainer>
                        </CardBody>
                    </Card>
                </Col>
            </>
        );

    }
}


export default withSnackbar(withStyles(customStyles, { name: "ConsumersListView.js" })(ConsumersListView));