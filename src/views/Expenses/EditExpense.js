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

class AddExpense extends React.Component {
    state = {
        _id: new URLSearchParams(this.props.location.search).get("id"),
        // ========== Payload start ==========
        expense_type: "",//(direct or indirect)
        commodity_group: "",
        expense_for: "",//(supplier or consumer)
        expense_user: "",//user_id    
        invoice_no: "",
        amount: "",
        date_of_expense: new Date(),
        expense_description: "",
        // ========== Payload ends ==========

        // =============== For Page Redirection =================
        isExpenseSuccess: false,


        // ==================== Date Validation ============
        isValidDate: true,

        //============ UI Options ========================
        options: {


            expense_type: [
                {
                    value: "direct",
                    label: "Direct"
                },
                {
                    value: "indirect",
                    label: "InDirect"
                }
            ],
            expense_for: [
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

            ]
        }
    };


    // ======= Handler functions start =======


    handleSubmit = e => {
        e.preventDefault();

        let payload = {};
        payload.expense_type = this.state.expense_type;
        payload.commodity_group = this.state.commodity_group;
        payload.expense_for = this.state.expense_for;
        payload.expense_user = this.state.expense_user;
        payload.invoice_no = this.state.invoice_no;
        payload.amount = this.state.amount;
        payload.date_of_expense = this.state.date_of_expense;
        payload.expense_description = this.state.expense_description;


        if (payload.expense_type === "") {
            this.props.enqueueSnackbar("Expense Type field is mandatory !", {
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

        Axios.post(`${CONSTANTS.SERVER_URL}/api/expenses/update/` + this.state._id, payload)
            .then(res => {
                this.props.enqueueSnackbar(
                    "Expense updated",
                    {
                        variant: "success"
                    },
                    this.setState({ isExpenseSuccess: true })
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
            this.setState({ date_of_expense: DATE }, console.log(this.state));
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

    // handleExpenseForChange = props => {

    //     if (props.value === "supplier") {
    //         let newOptions = this.state.options;
    //         newOptions.user = this.state.options.buffer.suppliers;
    //         this.setState({ options: newOptions, expense_for: "supplier" });
    //     } else {
    //         let newOptions = this.state.options;
    //         newOptions.user = this.state.options.buffer.consumers;
    //         this.setState({ options: newOptions, expense_for: "consumer" });
    //     }
    // };



    // =======  Handler functions end  =======


    // ======= Life Cycle methods start =======

    componentDidMount = () => {
        // let consumers = [];
        // let suppliers = [];
        let commodities = [];

        // // get consumers
        // Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/`).then(res => {
        //     if (res.data.length !== 0) {
        //         res.data.map(consumer => {
        //             let c = {};
        //             c.value = consumer._id;
        //             c.label = consumer.user_name;
        //             consumers.push(c)
        //             return null;
        //         });
        //     }
        // }).catch(err => {
        //     this.props.enqueueSnackbar(
        //         err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
        //         {
        //             variant: "warning"
        //         }
        //     );
        // })

        // get suppliers
        // Axios.get(`${CONSTANTS.SERVER_URL}/api/suppliers/`).then(res => {
        //     if (res.data.length !== 0) {
        //         res.data.map(supplier => {
        //             let s = {};
        //             s.value = supplier._id;
        //             s.label = supplier.user_name;
        //             suppliers.push(s)
        //             return null;
        //         });
        //     }
        // }).catch(err => {
        //     this.props.enqueueSnackbar(
        //         err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
        //         {
        //             variant: "warning"
        //         }
        //     );
        // })

        // let newBuffer = {};
        // newBuffer.consumers = consumers;
        // newBuffer.suppliers = suppliers;

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
        // newOptions.buffer = newBuffer;
        newOptions.commodities = commodities;
        this.setState({ options: newOptions })



        Axios.get(`${CONSTANTS.SERVER_URL}/api/expenses/` + this.state._id).then(response => {
            this.setState({
                expense_type: response.data.expense_type,
                commodity_group: response.data.commodity_group,
                expense_for: response.data.expense_for,
                expense_user: response.data.expense_user,
                invoice_no: response.data.invoice_no,
                amount: response.data.amount,
                date_of_expense: new Date(response.data.date_of_expense),
                expense_description: response.data.expense_description
            });
        }).catch(err => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

    };

    // =======  Life Cycle methods end  =======


    getOptionLabel = (id, optionName, matchParam, retrivalParam) => {
        return this.state.options[optionName].map(option => {
            if (option[matchParam] === id) {
                return option[retrivalParam];
            }
            return null;
        })
    }

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
                                            <h3 className="mb-0">Expense</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Expense information
                    </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Expense type
                            </label>
                                                        <br />
                                                        <Select
                                                            name="expense_type"
                                                            placeholder="Expense type..."
                                                            options={this.state.options.expense_type}
                                                            value={{
                                                                value: this.state.expense_type,
                                                                label: this.getOptionLabel(this.state.expense_type, "expense_type", "value", "label"),
                                                            }}
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
                                                            value={{
                                                                value: this.state.commodity_group,
                                                                label: this.getOptionLabel(this.state.commodity_group, "commodities", "value", "label"),
                                                            }}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {/* <Row>

                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Supplier / Consumer
                            </label>
                                                        <Select
                                                            name="expense_for"
                                                            placeholder="Choose supplier / consumer..."
                                                            options={this.state.options.expense_for}
                                                            value={{
                                                                value: this.state.expense_for,
                                                                label: this.state.expense_for,
                                                            }}
                                                            onChange={this.handleExpenseForChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Name
                            </label>
                                                        <Select
                                                            name="expense_user"
                                                            placeholder="Choose supplier / consumer Name .."
                                                            options={this.state.options.user}
                                                            value={{
                                                                value: this.state.expense_user,
                                                                label: this.state.expense_user,
                                                            }}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row> */}
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
                                                            value={this.state.invoice_no}
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
                                                            value={this.state.amount}
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
                                                                        placeholder: "Expense date",
                                                                        disabled: true
                                                                    }}
                                                                    utc={true}
                                                                    value={this.state.date_of_expense}
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
                                            Expense Description
                    </h6>
                                        <div className="pl-lg-4">
                                            <FormGroup>
                                                <Input
                                                    className="form-control-alternative"
                                                    rows="4"
                                                    placeholder="Description about this expense (optional)"
                                                    type="textarea"
                                                    name="expense_description"
                                                    value={this.state.expense_description}
                                                    onChange={this.handleElementChange}
                                                />
                                            </FormGroup>
                                        </div>
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button color="info" onClick={this.handleSubmit}>
                                        Update Expense
                  </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Redirect on submit */}
                {this.state.isExpenseSuccess ? <Redirect to="/admin/expenses" /> : null}
            </>
        );
    }


}


export default withSnackbar(AddExpense);