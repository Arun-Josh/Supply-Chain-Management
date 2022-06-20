import React from "react";
import ReactDatetime from "react-datetime";
// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Container,
    Row,
    Col,
    CardFooter
} from "reactstrap";
import Select from 'react-select'
import Axios from "axios";
import CommonHeader from "../../components/Headers/CommonHeader.js";
import CONSTANTS from "../../variables/general.js"
import { withSnackbar } from "notistack";
import { Redirect } from "react-router-dom";

class AddIncome extends React.Component {
    state = {
        // ========== Payload start ==========
        income_type: "",//(direct or indirect)
        commodity_group: "",
        income_for: "",//(supplier or consumer)
        income_user: "",//user_id    
        invoice_no: "",
        amount: "",
        date_of_income: new Date(),
        income_description: "",
        // ========== Payload ends ==========

        // =============== For Page Redirection =================
        isIncomeSuccess: false,


        // ==================== Date Validation ============
        isValidDate: true,

        //============ UI Options ========================
        options: {


            income_type: [
                {
                    value: "direct",
                    label: "Direct"
                },
                {
                    value: "indirect",
                    label: "InDirect"
                },
                {
                    value: "discount",
                    label: "Discount"
                }
            ],
            income_for: [
                {
                    value: "supplier",
                    label: "Supplier"
                },
                {
                    value: "consumer",
                    label: "Consumer"
                }
            ],
            user: [],
            commodities: [

            ],
            buffer: {
                consumers: [],
                suppliers: []
            }
        }
    };


    // ======= Handler functions start =======


    handleSubmit = e => {
        e.preventDefault();

        let payload = {};
        payload.income_type = this.state.income_type;
        payload.commodity_group = this.state.commodity_group;
        payload.income_for = this.state.income_for;
        payload.income_user = this.state.income_user;
        payload.invoice_no = this.state.invoice_no;
        payload.amount = this.state.amount;
        payload.date_of_income = this.state.date_of_income;
        payload.income_description = this.state.income_description;


        if (payload.income_type === "") {
            this.props.enqueueSnackbar("Income Type field is mandatory !", {
                variant: "error"
            });
            return;
        }
        if (payload.commodity_group === "") {
            this.props.enqueueSnackbar("Commodity field is mandatory !", {
                variant: "error"
            });
            return;
        }

        if (payload.income_for === "") {
            this.props.enqueueSnackbar("Choose Customer or Supplier", {
                variant: "error"
            });
            return;
        }

        if (payload.amount === "") {
            this.props.enqueueSnackbar("Amount field is mandatory !", {
                variant: "error"
            });
            return;
        }

        if (!this.state.isValidDate) {
            this.props.enqueueSnackbar("Choose proper date !", {
                variant: "error"
            });
            return;
        }


        Axios.post(`${CONSTANTS.SERVER_URL}/api/incomes/add`, payload)
            .then(res => {
                this.props.enqueueSnackbar(
                    "Income successfully added",
                    {
                        variant: "success"
                    },
                    this.setState({ isIncomeSuccess: true })
                );
                console.log(res);
            })
            .catch(err => {
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
            });
    };


    handleElementChange = (props) => {
        this.setState({ [props.target.name]: props.target.value });
    };

    handleDateChange = e => {
        console.log(e.format('DD-MM-YYYY'))
        if (e.isValid) {
            const DATE = new Date(e.format("DD-MM-YYYY"));
            // console.log(DATE)
            this.setState({ date_of_income: DATE }, console.log(this.state));
            this.setState({ isValidDate: true });
        } else {
            this.setState({ isValidDate: false });
            console.log("Date incorrect");
        }
    };
    handleSelectChange = (props, meta) => {
        const name = meta.name;
        const value = props.value;
        console.log(name + " " + value)
        console.log(meta)
        this.setState({ [name]: value });
    };

    handleIncomeForChange = props => {

        if (props.value === "supplier") {
            let newOptions = this.state.options;
            newOptions.user = this.state.options.buffer.suppliers;
            this.setState({ options: newOptions, income_for: "supplier" });
        } else {
            let newOptions = this.state.options;
            newOptions.user = this.state.options.buffer.consumers;
            this.setState({ options: newOptions, income_for: "consumer" });
        }
    };



    // =======  Handler functions end  =======


    // ======= Life Cycle methods start =======

    componentDidMount = () => {
        let consumers = [];
        let suppliers = [];
        let commodities = [];

        // get consumers
        Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(consumer => {
                    let c = {};
                    c.value = consumer._id;
                    c.label = consumer.user_name;
                    consumers.push(c)
                    return null;
                });
            }
        }).catch(err => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        // get suppliers
        Axios.get(`${CONSTANTS.SERVER_URL}/api/suppliers/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(supplier => {
                    let s = {};
                    s.value = supplier._id;
                    s.label = supplier.user_name;
                    suppliers.push(s)
                    return null;
                });
            }
        }).catch(err => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        let newBuffer = {};
        newBuffer.consumers = consumers;
        newBuffer.suppliers = suppliers;

        // get commodities
        Axios.get(`${CONSTANTS.SERVER_URL}/api/commodities/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(commodity => {
                    let c = {};
                    c.value = commodity._id;
                    c.label = commodity.commodity_group_name;
                    commodities.push(c)
                    return null;
                });
            }
        }).catch(err => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        let newOptions = this.state.options;
        newOptions.buffer = newBuffer;
        newOptions.commodities = commodities;
        this.setState({ options: newOptions })

    };

    // =======  Life Cycle methods end  =======


    render() {
        return (
            <>
                <CommonHeader />
                <Container>
                    <Row>
                        <Col className=" mt--7 order-xl-1" xl="12">
                            <Card className="bg-secondary shadow">
                                <CardHeader className="bg-white border-0">
                                    <Row className="align-items-center">
                                        <Col xs="8">
                                            <h3 className="mb-0">Income</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Income information
                    </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Income type
                            </label>
                                                        <br />
                                                        <Select
                                                            name="income_type"
                                                            placeholder="Income type..."
                                                            options={this.state.options.income_type}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Commodity
                            </label>
                                                        <Select
                                                            name="commodity_group"
                                                            placeholder="Choose commodity..."
                                                            options={this.state.options.commodities}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>

                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Supplier / Consumer
                            </label>
                                                        <Select
                                                            name="income_for"
                                                            placeholder="Choose supplier / consumer..."
                                                            options={this.state.options.income_for}
                                                            onChange={this.handleIncomeForChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Name
                            </label>
                                                        <Select
                                                            name="income_user"
                                                            placeholder="Choose supplier / consumer.Name .."
                                                            options={this.state.options.user}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-invoice"
                                                        >
                                                            Invoice number
                            </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            id="input-invoice"
                                                            name="invoice_no"
                                                            autoComplete="off"
                                                            placeholder="Invoice number"
                                                            type="text"
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-amount"
                                                        >
                                                            Amount
                            </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            id="input-amount"
                                                            name="amount"
                                                            placeholder="Amount"
                                                            type="text"
                                                            autoComplete="off"
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">Date</label>
                                                        <FormGroup>
                                                            <InputGroup className="input-group-alternative">
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>
                                                                        <i className="ni ni-calendar-grid-58" />
                                                                    </InputGroupText>
                                                                </InputGroupAddon>
                                                                <ReactDatetime
                                                                    inputProps={{
                                                                        placeholder: "Income date"
                                                                    }}
                                                                    utc={true}
                                                                    defaultValue={new Date()}
                                                                    //value={this.state.date_of_income}
                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false}
                                                                    onChange={this.handleDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                        </div>
                                        <hr className="my-4" />
                                        {/* Description */}
                                        <h6 className="heading-small text-muted mb-4">
                                            Income Description
                    </h6>
                                        <div className="pl-lg-4">
                                            <FormGroup>
                                                <Input
                                                    className="form-control-alternative"
                                                    rows="4"
                                                    placeholder="Description about this income (optional)"
                                                    type="textarea"
                                                    name="income_description"
                                                    onChange={this.handleElementChange}
                                                />
                                            </FormGroup>
                                        </div>
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button color="info" onClick={this.handleSubmit}>
                                        Save Income
                  </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Redirect on submit */}
                {this.state.isIncomeSuccess ? <Redirect to="/admin/income" /> : null}
            </>
        );
    }


}


export default withSnackbar(AddIncome);