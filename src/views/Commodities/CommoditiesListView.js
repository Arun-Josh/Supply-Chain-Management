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

class CommoditiesListView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            commodities: []
        };
    }

    componentDidMount() {

        this.getData()
    }

    getData() {

        Axios.get(`${CONSTANTS.SERVER_URL}/api/commodities/`, {

        }
        )
            .then(res => {


                let commodities = [];

                res.data.forEach(trans => {
                    commodities.push(trans)
                })

                this.setState({ commodities })


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

            let newRow = [row.commodity_group_name, row.sub_commodities.length, <Button className="btn-icon btn-2" color="primary" size="sm" type="button" onClick={() => { window.location.href = "/admin/commodities/edit?id=" + row._id }}>
                <span className="btn-inner--icon">
                    <i className="ni ni-scissors" />
                </span>
            </Button >
                ,
                <Button className="btn-icon btn-2 btn-danger" size="sm" color="primary" type="button" onClick={() => { this.handleDelete(row._id) }}>
                    <span className="btn-inner--icon">
                    ----{/* <i className="ni ni-archive-2" /> */}
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

        Axios.delete(`${CONSTANTS.SERVER_URL}/api/commodities/` + props)
            .then(response => {
                this.props.enqueueSnackbar(
                    "Commodity Deleted",
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
            }, {
                name: "Items", label: "Items", options: {
                    filter: false, sort: true, print: false, className: classnames(
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
                <CommonHeader buttonText="Add Commodity" redirectURL={`/admin/commodities/add`} />
                <Col className=" mt--7 order-xl-1" xl="12">
                    <Card className="bg-secondary shadow">
                        <CardHeader className="bg-white border-0">
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <h3 className="mb-0">Commodities</h3>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            {/* MUI DATATABLE */}
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <MuiThemeProvider theme={this.getMuiTheme()}>

                                        <MUIDataTable title={""} data={this.generateTableData(this.state.commodities)} columns={columns} options={options} />
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


export default withSnackbar(withStyles(customStyles, { name: "CommoditiesListView.js" })(CommoditiesListView));