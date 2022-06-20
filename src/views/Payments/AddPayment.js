import React from "react";
import ReactDatetime from "react-datetime";
// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
    CardFooter
} from "reactstrap";
import Select from "react-select";

import CommonHeader from "components/Headers/CommonHeader.js";
import Axios from "axios";
import { withSnackbar } from "notistack";
import CONSTANTS from "../../variables/general.js";
import { Redirect } from "react-router-dom";

export class AddPayment extends React.Component {
    state = {
        // ========== Payload start ==========
        payment_for: "",
        payment_type: "", // consumer / supplier
        commodity_group: "",
        invoice_no: "",
        amount: "",
        date_of_payment: new Date(),
        mode_of_payment: "",
        bank: "",
        account_holder_name: "",
        account_number: "",
        ifsc: "",
        dd_no: "",
        cheque_no: "",
        my_account_number: "",
        payment_description: "",
        // ========== Payload end ==========

        // ========== Only in UI start ==========
        my_bank: "",
        my_account_holder_name: "",
        my_ifsc: "",
        isValidDate: true,
        // ==========  Only in UI end  ==========

        options: {
            myaccounts: [

            ],
            payment_type: [
                {
                    value: "supplier",
                    label: "Supplier"
                },
                {
                    value: "consumer",
                    label: "Consumer"
                }
            ],
            payment_for: [
                // {
                //   value: "consumer1",
                //   label: "Consumer 1"
                // },
                // {
                //   value: "supplier1",
                //   label: "supplier 2"
                // }
            ],
            mode_of_payment: [
                {
                    value: "cash",
                    label: "Cash"
                },
                {
                    value: "netbanking",
                    label: "Net Banking"
                },
                {
                    value: "dd",
                    label: "Demand Draft"
                },
                {
                    value: "cheque",
                    label: "Cheque"
                }
            ],
            commodities: [

            ]
        },
        buffer: {
            consumers: [],
            suppliers: []
        },
        visible: {
            invoice: false,
            cash: false,
            netbanking: false,
            dd: false,
            cheque: false
        },
        isInvoiceDisabled: false,
        isPaymentSuccess: false,
        isSubmitBtnDisabled: false,
    };

    handleSubmit = e => {
        e.preventDefault();

        let payload = {};
        payload.payment_for = this.state.payment_for;
        payload.payment_type = this.state.payment_type;
        payload.commodity_group = this.state.commodity_group;
        payload.invoice_no = this.state.invoice_no;
        payload.amount = this.state.amount;
        payload.date_of_payment = this.state.date_of_payment;
        payload.mode_of_payment = this.state.mode_of_payment;
        payload.bank = this.state.bank;
        payload.account_holder_name = this.state.account_holder_name;
        payload.account_number = this.state.account_number;
        payload.ifsc = this.state.ifsc;
        payload.dd_no = this.state.dd_no;
        payload.cheque_no = this.state.cheque_no;
        payload.my_account_number = this.state.my_account_number;
        payload.my_bank = this.state.my_bank;
        payload.payment_description = this.state.payment_description;


        if (payload.payment_type === "") {
            this.props.enqueueSnackbar("Payment Type field is mandatory !", {
                variant: "error"
            });
            return;
        }
        if (payload.payment_for === "") {
            this.props.enqueueSnackbar("Select the Supplier / Consumer !", {
                variant: "error"
            });
            return;
        }

        if (payload.commodity_group === "") {
            this.props.enqueueSnackbar("Commodity group field is mandatory !", {
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

        if (payload.mode_of_payment === "") {
            this.props.enqueueSnackbar("Mode of payment field is mandatory !", {
                variant: "error"
            });
            return;
        }

        this.setState({ isSubmitBtnDisabled: true })
        Axios.post(`${CONSTANTS.SERVER_URL}/api/payments/add`, payload)
            .then(res => {
                this.props.enqueueSnackbar(
                    "Payment successfully added",
                    {
                        variant: "success"
                    },
                    this.setState({ isPaymentSuccess: true })
                );

            })
            .catch(err => {
                this.setState({ isSubmitBtnDisabled: false })
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );

            });
    };

    // ======= Handler functions start =======

    handleChange = e => {
        // console.log(e.target.name + " "+ e.target.value)
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    handleDateChange = e => {
        // console.log(e.format('MM-DD-YYYY'))
        if (e.isValid) {
            const DATE = e.format();
            // console.log(DATE)
            this.setState({ date_of_payment: DATE }, console.log(this.state));
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

    handlePaymentTypeChange = props => {
        this.setState({ payment_for: props.value });
        if (props.value === "supplier") {
            this.setState({ isInvoiceDisabled: false });
            let newOptions = this.state.options;
            newOptions.payment_for = this.state.buffer.suppliers;
            this.setState({ options: newOptions });
            this.setState({ payment_for: "" });
            this.setState({ payment_type: "supplier" });
        } else {
            this.setState({ isInvoiceDisabled: true });
            let newOptions = this.state.options;
            newOptions.payment_for = this.state.buffer.consumers;
            this.setState({ options: newOptions });
            this.setState({ payment_for: "" });
            this.setState({ payment_type: "consumer" });
        }
    };

    handleModeChange = props => {
        const mode_of_payment = props.value;
        console.log(mode_of_payment);
        let newVisible = {};
        Object.keys(this.state.visible).map(mode => {
            if (mode === mode_of_payment) {
                newVisible[mode] = true;
            } else {
                newVisible[mode] = false;
            }
            return null;
        });
        this.setState({ visible: newVisible });
        this.setState({ mode_of_payment: mode_of_payment });
    };

    handleMyAccountChange = (props, meta) => {
        const name = meta.name;
        const value = props.value;
        this.setState({ [name]: value });

        // Axios.get(`${CONSTANTS.SERVER_URL}/api/`)
        //     .then(res => {
        //         //TODO set bank details
        //         let my_bank = "";
        //         let my_account_holder_name = "";
        //         let my_account_number = "";
        //         let my_ifsc = "";

        //         this.setState({ my_bank: my_bank });
        //         this.setState({ my_account_holder_name: my_account_holder_name });
        //         this.setState({ my_account_number: my_account_number });
        //         this.setState({ my_ifsc: my_ifsc });
        //     })
        //     .catch(err => {
        //         this.props.enqueueSnackbar(
        //             err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
        //             {
        //                 variant: "warning"
        //             }
        //         );
        //     });
    };

    // =======  Handler functions end  =======

    // ======= Life Cycle methods start =======

    componentDidMount = () => {
        let consumers = [];
        let suppliers = [];
        let commodities = [];
        let myaccounts = [];
        Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(consumer => {
                    let c = {};
                    c.value = consumer._id;
                    c.label = consumer.user_name;
                    consumers.push(c)
                    return null;
                });
                let newBuffer = this.state.buffer;
                newBuffer.consumers = consumers;
                this.setState({ buffer: newBuffer });
            }
        }).catch((err) => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        Axios.get(`${CONSTANTS.SERVER_URL}/api/suppliers/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(supplier => {
                    let s = {};
                    s.value = supplier._id;
                    s.label = supplier.user_name;
                    suppliers.push(s)
                    return null;
                });
                let newBuffer = this.state.buffer;
                newBuffer.suppliers = suppliers;
                this.setState({ buffer: newBuffer });
            }
        }).catch((err) => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        Axios.get(`${CONSTANTS.SERVER_URL}/api/commodities/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(commodity => {
                    let c = {};
                    c.value = commodity._id;
                    c.label = commodity.commodity_group_name;
                    commodities.push(c)
                    return null;
                });
                let newOptions = this.state.options;
                newOptions.commodities = commodities;
                this.setState({ options: newOptions })
            }
        }).catch((err) => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })

        Axios.get(`${CONSTANTS.SERVER_URL}/api/admins/`).then(res => {
            if (res.data.length !== 0) {
                res.data[0].bank_accounts.map(bank => {
                    let c = {};
                    c.value = bank.account_no;
                    c.label = bank.account_no;
                    myaccounts.push(c)
                    return null;
                });
                let newOptions = this.state.options;
                newOptions.myaccounts = myaccounts;
                this.setState({ options: newOptions })
            }
        }).catch((err) => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })



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
                                            <h3 className="mb-0">Payment</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Payment information
                    </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Payment type
                            </label>
                                                        <br />
                                                        <Select
                                                            name="payment_type"
                                                            placeholder="Payment type..."
                                                            options={this.state.options.payment_type}
                                                            onChange={this.handlePaymentTypeChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Supplier / Consumer
                            </label>
                                                        <Select
                                                            name="payment_for"
                                                            placeholder="Choose supplier / consumer..."
                                                            options={this.state.options.payment_for}
                                                            onChange={this.handleSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
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
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-invoice"
                                                        >
                                                            Invoice number
                            </label>
                                                        <Input
                                                            disabled={this.state.isInvoiceDisabled}
                                                            className="form-control-alternative"
                                                            id="input-invoice"
                                                            name="invoice_no"
                                                            autoComplete="off"
                                                            placeholder="Invoice number"
                                                            type="text"
                                                            onChange={this.handleChange}
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
                                                            onChange={this.handleChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
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
                                                                        placeholder: "Payment date"
                                                                    }}
                                                                    utc={true}
                                                                    defaultValue={new Date()}

                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false}
                                                                    onChange={this.handleDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-city"
                                                        >
                                                            Mode of Payment
                            </label>
                                                        <Select
                                                            name="mode_of_payment"
                                                            placeholder="Choose mode of payment..."
                                                            options={this.state.options.mode_of_payment}
                                                            onChange={this.handleModeChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {this.state.visible.netbanking ? (
                                                <NetBanking
                                                    handleChange={this.handleChange}
                                                    handleMyAccountChange={this.handleMyAccountChange}
                                                    state={this.state}
                                                    options={this.state.options}
                                                    payment_for={this.state.payment_for}
                                                />
                                            ) : null}
                                            {this.state.visible.dd ? (
                                                <DD handleChange={this.handleChange} />
                                            ) : null}
                                            {this.state.visible.cheque ? (
                                                <Cheque handleChange={this.handleChange} />
                                            ) : null}
                                        </div>
                                        <hr className="my-4" />
                                        {/* Description */}
                                        <h6 className="heading-small text-muted mb-4">
                                            Payment Description
                    </h6>
                                        <div className="pl-lg-4">
                                            <FormGroup>
                                                <Input
                                                    className="form-control-alternative"
                                                    rows="4"
                                                    placeholder="Description about this payment (optional)"
                                                    type="textarea"
                                                    name="payment_description"
                                                    onChange={this.handleChange}
                                                />
                                            </FormGroup>
                                        </div>
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button disabled={this.state.isSubmitBtnDisabled} color="info" onClick={this.handleSubmit}>
                                        Save Payment
                  </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Redirect on submit */}
                {this.state.isPaymentSuccess ? <Redirect to="/admin/payments" /> : null}
            </>
        );
    }
}

class NetBanking extends React.Component {
    render() {
        return (
            <>
                <h6 className="heading-small text-muted mb-4">
                    Net Banking information
        </h6>
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-account-no">
                                Account Number
              </label>
                            <br />
                            <Input
                                name="account_number"
                                id="input-account-no"
                                className="form-control-alternative"
                                placeholder="Account No"
                                type="text"
                                autoComplete="off"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-account-holder-name"
                            >
                                Account Holder Name
              </label>
                            <br />
                            <Input
                                name="account_holder_name"
                                id="input-account-holder-name"
                                className="form-control-alternative"
                                placeholder="Account Holder Name"
                                type="text"
                                autoComplete="off"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-bank">
                                Bank
              </label>
                            <br />
                            <Input
                                name="bank"
                                id="input-bank"
                                className="form-control-alternative"
                                placeholder="Bank"
                                type="text"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-ifsc">
                                IFSC
              </label>
                            <br />
                            <Input
                                name="ifsc"
                                id="input-ifsc"
                                className="form-control-alternative"
                                placeholder="IFSC"
                                autoComplete="off"
                                type="text"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                {/* <hr className="my-4" /> */}
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label">
                                My Account Number
              </label>
                            <br />
                            <Select
                                name="my_account_number"
                                placeholder="Payment for"
                                options={this.props.options.myaccounts}
                                onChange={this.props.handleMyAccountChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-account-holder-name"
                            >
                                My Account Holder Name
              </label>
                            <br />
                            <Input
                                disabled
                                id="input-account-holder-name"
                                className="form-control-alternative"
                                placeholder="Account Holder Name"
                                type="text"
                                value={this.props.state.my_account_holder_name}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-bank">
                                My Bank
              </label>
                            <br />
                            <Input
                                disabled
                                id="input-bank"
                                className="form-control-alternative"
                                placeholder="Bank"
                                type="text"
                                name="my_bank"
                                value={this.props.state.my_bank}
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-ifsc">
                                My IFSC
              </label>
                            <br />
                            <Input
                                disabled
                                id="input-ifsc"
                                className="form-control-alternative"
                                placeholder="IFSC"
                                type="text"
                                value={this.props.state.my_ifsc}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </>
        );
    }
}

class DD extends React.Component {
    render() {
        return (
            <>
                <h6 className="heading-small text-muted mb-4">
                    Demand Draft Information
        </h6>
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-bank">
                                Demand Draft Number
              </label>
                            <br />
                            <Input
                                className="form-control-alternative"
                                placeholder="Demand Draft number"
                                type="text"
                                name="dd_no"
                                autoComplete="off"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </>
        );
    }
}

class Cheque extends React.Component {
    render() {
        return (
            <>
                <h6 className="heading-small text-muted mb-4">Cheque Information</h6>
                <Row>
                    <Col lg="6">
                        <FormGroup>
                            <label className="form-control-label" htmlFor="input-bank">
                                Cheque Number
              </label>
                            <br />
                            <Input
                                className="form-control-alternative"
                                placeholder="Demand Draft number"
                                type="text"
                                autoComplete="off"
                                name="cheque_no"
                                onChange={this.props.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </>
        );
    }
}

export default withSnackbar(AddPayment);
