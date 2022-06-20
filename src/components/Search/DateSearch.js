import React from "react";
import ReactDatetime from "react-datetime";
import MUIDataTable from "mui-datatables";
// reactstrap components
import {
    Input,
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Form,
    Row,
    Col,
    CardFooter
} from "reactstrap";
import Select from "react-select";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Axios from "axios";
import { withSnackbar } from "notistack";
import ReactToPrint from 'react-to-print';
import PrintStatement from "components/Print/PrintStatement.js";

const customStyles = {
    CustomStyles: {
        '& td': { backgroundColor: "#FAA", boxShadow: "0 8px 4px 0 rgba(0, 0, 0, 0.2)" }
    },
    NameCell: {
        fontWeight: 900
    },
};

class DateSearch extends React.Component {
    // constructor(props) {
    //     super(props);
    // }

    state = {
        data: [],
        from_date: new Date().toISOString(),
        to_date: new Date().toISOString(),
        options: {
            users: []
        },
        filter: {
            user_id: ""
        },
        isValidFromDate: false,
        isValidToDate: false,
        isDataReceived: false,
        closing_balance: "",
        opening_balance: "",
        isStatement: false
    }

    componentDidMount = () => {

        Axios.get(this.props.getUsersLink)
            .then(usersRes => {
                let usersOptions = [];
                usersRes.data.map(user => {
                    let u = {};
                    u.value = user._id;
                    u.label = user.user_name;
                    usersOptions.push(u);
                    return null;
                })
                let options = this.state.options;
                options.users = usersOptions;
                this.setState({ options: options });
            })
            .catch(err => {
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
            });
    }

    handleFilterSelectChange = (props, meta) => {
        const name = meta.name;
        const value = props.value;
        let filter = this.state.filter;
        filter[name] = value;
        this.setState({ filter: filter });
    };

    getdata = e => {
        // Module Specific Check
        var link = this.props.submitLink;
        // if (this.props.module === "statement" && this.state.filter.user_id === "") {
        //     link = link + "admin/true/";
        //     console.log(link)
        // }
        this.setState({ isDataReceived: false })
        const from_date = new Date(this.state.from_date);
        const to_date = new Date(this.state.to_date);
        console.log(this.state)
        console.log(to_date - from_date)
        if (!(to_date - from_date >= 0)) {
            this.props.enqueueSnackbar(
                "From date should should be less than To Date",
                {
                    variant: "error"
                }
            );
            return;
        }
        from_date.setHours(0, 0, 0, 0)
        to_date.setHours(23, 59, 59, 99)
        this.props.disableSubmitButton(true);
        Axios.get(link + `${from_date.toISOString()}/${to_date.toISOString()}/${this.state.filter.user_id}`)
            .then(res => {
                this.props.disableSubmitButton(false);

                let data = [];
                if (this.props.module === "statement") {
                    this.setState({ isStatement: true })
                    this.setState({ opening_balance: res.data[0].opening_balance })
                    this.setState({ closing_balance: res.data[0].closing_balance })

                }
                res.data.forEach(trans => {
                    data.push(trans)
                })

                this.setState({ data })

                this.setState({ isDataReceived: true })
            })
            .catch(err => {
                this.props.enqueueSnackbar(
                    //TODO : Perform proper error handling
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "No Result Found") : "No Result Found",
                    {
                        variant: "warning"
                    }
                );
            })

    }

    handleFromDateChange = e => {
        if (e.isValid) {
            const DATE = e.format();
            this.setState({ from_date: DATE }, console.log(this.state));
            this.setState({ isValidFromDate: true });
        } else {
            this.setState({ isValidFromDate: false });
        }
    };

    handleToDateChange = e => {
        if (e.isValid) {
            const DATE = e.format();
            this.setState({ to_date: DATE }, console.log(this.state));
            this.setState({ isValidToDate: true });
        } else {
            this.setState({ isValidToDate: false });
        }
    };

    render() {
        return (
            <>
                <div style={{ padding: "20px" }}>
                    <Row>
                        <Col className=" mt--7 order-xl-1" xl="12">
                            <Card className="bg-secondary shadow">
                                <CardHeader className="bg-white border-0">
                                    <Row className="align-items-center">
                                        <Col xs="8">
                                            <h3 className="mb-0">Statement</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Statement
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">From</label>
                                                        <FormGroup>
                                                            <InputGroup className="input-group-alternative">
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>
                                                                        <i className="ni ni-calendar-grid-58" />
                                                                    </InputGroupText>
                                                                </InputGroupAddon>
                                                                <ReactDatetime
                                                                    inputProps={{
                                                                        placeholder: "From date"
                                                                    }}
                                                                    utc={true}
                                                                    defaultValue={new Date()}
                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false}
                                                                    onChange={this.handleFromDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">To</label>
                                                        <FormGroup>
                                                            <InputGroup className="input-group-alternative">
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>
                                                                        <i className="ni ni-calendar-grid-58" />
                                                                    </InputGroupText>
                                                                </InputGroupAddon>
                                                                <ReactDatetime
                                                                    inputProps={{
                                                                        placeholder: "To date"
                                                                    }}
                                                                    utc={true}
                                                                    defaultValue={new Date()}
                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false}
                                                                    onChange={this.handleToDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* <hr/> */}

                                            <h6 className="heading-small text-muted">
                                                Filter by
                                            </h6>

                                            <Row>
                                                <Col lg="3">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-Commodity"
                                                        >
                                                            User
                                                        </label>
                                                        <br />
                                                        <Select
                                                            placeholder='Select user'
                                                            name='user_id'
                                                            options={this.state.options.users}
                                                            onChange={this.handleFilterSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button
                                        disabled={this.props.isSubmitBtnDisabled}
                                        color="info"
                                        onClick={this.getdata}
                                    >
                                        Get List
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                    {this.state.isDataReceived ? <ListView user_id={this.state.filter.user_id} data={this.state.data} columns={this.props.columns} generateTableData={this.props.generateTableData} module={this.props.module} from={this.state.from_date} to={this.state.to_date} options={this.props.options} opening_balance={this.state.opening_balance} closing_balance={this.state.closing_balance} isStatement={this.state.isStatement} /> : ""}
                </div>
            </>
        )
    }
}

class ListView extends React.Component {

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

    generateTableData = this.props.generateTableData;

    printStatement = () => {

    }

    render() {

        const columns = this.props.columns;

        const options = this.props.options;
        return (
            <>

                <br />
                <CardBody>
                    <Form>
                        <h6 className="heading-small text-muted mb-4">
                            Statement List
                                    </h6>
                        <div className="pl-lg-4">
                            {this.props.statement}
                        </div>
                    </Form>
                </CardBody>
                <Col className=" mt--7 order-xl-1" xl="12">
                    <Card className="bg-secondary shadow">
                        <CardHeader className="bg-white border-0">
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <h3 className="mb-0">Statements</h3>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            {this.props.isStatement ? <Balance opening_balance={this.props.opening_balance} closing_balance={this.props.closing_balance} /> : ""}
                            {/* MUI DATATABLE */}
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <MuiThemeProvider theme={this.getMuiTheme()}>

                                        <MUIDataTable title={""} data={this.generateTableData(this.props.data)} columns={columns} options={options} />
                                    </MuiThemeProvider>
                                </GridItem>
                            </GridContainer>
                        </CardBody>
                        {this.props.module === "statement" && <>
                            <ReactToPrint
                                trigger={() =>
                                    <CardFooter>
                                        <div className="text-center">
                                            <Button
                                                className="col-md-4"
                                                color="default"
                                                onClick={this.printStatement}
                                            >
                                                Print Statement
                                        </Button>
                                        </div>
                                    </CardFooter>}
                                content={() => this.componentRef}
                            />
                            <div style={{ display: "none" }}>
                                <PrintStatement user_id={this.props.user_id} data={this.props.data} from={this.props.from} to={this.props.to} ref={el => (this.componentRef = el)} />
                            </div>
                        </>}
                    </Card>
                </Col>
            </>
        )
    }
}



class Balance extends React.Component {
    render() {
        return (
            <>
                {/* <Row> */}
                    {/* <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-consumer-name"
                            >
                                Opening Balance
                            </label>
                            <br />
                            <Input
                                disabled="true"
                                id="input-opening-balance"
                                className="form-control-alternative"
                                placeholder="Opening Balance"
                                name="opening_balance"
                                value={this.props.opening_balance}
                                type="text"
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-consumer-name"
                            >
                                Closing Balance
                            </label>
                            <br />
                            <Input
                                disabled="true"
                                id="input-closing-balance"
                                className="form-control-alternative"
                                placeholder="Closing Balance"
                                value={this.props.closing_balance}
                                name="closing_balance"
                                type="text"
                            />
                        </FormGroup>
                    </Col>


                </Row> */}
            </>)
    }
}

export default withSnackbar(withStyles(customStyles, { name: "DateSearch.js" })(DateSearch));
