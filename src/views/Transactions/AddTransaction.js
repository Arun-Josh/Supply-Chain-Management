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
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Input,
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

class AddTransaction extends React.Component {

    state = {
        transaction_type: "",           // consumer / supplier
        transaction_for: "",            // consumer name / supplier name
        commodity_group: "",            // id
        invoice_no: "",
        date_of_transaction: new Date(),
        total: 0,
        discount: 0,
        net_total: 0,
        transaction_description: "",
        sub_commodities: [
            // {
            //     "_id": "5e86ce69c5af4b1c78cea9b9",
            //     "sub_commodity_name": "Sub commodity",
            //     "sub_commodity_quantity": 12,            // available
            //     "sub_commodity_price": 0,                // Chosen
            //     "sub_commodity_transacted_quantity": 0 , // Chosen
            //     "sub_commodity_price_per_unit": 0        // Chosen
            // }
        ],
        commodity_groups: [],
        options: {
            commodity_groups: [],
            transaction_type: [
                {
                    label: "Supplier",
                    value: "supplier"
                },
                {
                    label: "Consumer",
                    value: "consumer"
                }
            ],
            transaction_for: []
        },
        buffer: {
            consumers: [],
            suppliers: []
        },
        visible: {
            invoice: false
        },
        isTransactionSuccess: false,
        isInvoiceDisabled: false
    }

    // ======= Handler functions start =======

    handleSubmit = e => {
        let payload = {};

        payload.transaction_for = this.state.transaction_for;
        payload.transaction_type = this.state.transaction_type;
        payload.commodity_group = this.state.commodity_group;

        //Remove's commodities with quantity as 0
        payload.sub_commodities = [];
        let atleastOne = false;
        this.state.sub_commodities.map(sub_commodity => {
            if (sub_commodity.sub_commodity_transacted_quantity > 0) {
                atleastOne = true;
                payload.sub_commodities.push(sub_commodity)
            }
            return null;
        })

        if (!atleastOne) {
            this.props.enqueueSnackbar("Atleast one commodity's quantity should be greater than 0 !", {
                variant: "error"
            });
            return;
        }

        payload.invoice_no = this.state.invoice_no;
        payload.date_of_transaction = this.state.date_of_transaction;
        payload.total = this.state.total;
        payload.discount = this.state.discount;
        payload.net_total = this.state.net_total;

        if (payload.transaction_type === "") {
            this.props.enqueueSnackbar("Transaction type is mandatory !", {
                variant: "error"
            });
            return;
        }

        if (payload.transaction_for === "") {
            this.props.enqueueSnackbar("Transaction for is mandatory !", {
                variant: "error"
            });
            return;
        }

        if (payload.commodity_group_name === "") {
            this.props.enqueueSnackbar("Commodity group is mandatory !", {
                variant: "error"
            });
            return;
        }

        if (payload.discount > payload.total) {
            this.props.enqueueSnackbar("Discount can't be greater than total !", {
                variant: "error"
            });
            return;
        }
        payload.transaction_description = this.state.transaction_description;

        Axios.post(`${CONSTANTS.SERVER_URL}/api/transactions/add`, payload)
            .then(res => {
                console.log(res);
                this.props.enqueueSnackbar(
                    "Transaction saved successfully",
                    {
                        variant: "success"
                    }
                );
                this.setState({ isTransactionSuccess: true })
            })
            .catch(err => {
                // debugger;
                if (err.response.data.includes("duplicate key error collection")) {
                    this.props.enqueueSnackbar(
                        "Invoice Id should be unique !",
                        {
                            variant: "error"
                        }
                    );
                } else {
                    this.props.enqueueSnackbar(
                        "Something went wrong, Check back after sometime :(",
                        {
                            variant: "warning"
                        }
                    );
                }
                console.log(err);
            });
    };

    handleTransactionTypeChange = (props) => {
        this.setState({ transaction_for: props.value });
        if (props.value === "supplier") {
            this.setState({ isInvoiceDisabled: true });
            let newOptions = this.state.options;
            newOptions.transaction_for = this.state.buffer.suppliers;
            this.setState({ options: newOptions });
            this.setState({ transaction_for: "" });
            this.setState({ transaction_type: "supplier" });
        } else {
            this.setState({ isInvoiceDisabled: false });
            let newOptions = this.state.options;
            newOptions.transaction_for = this.state.buffer.consumers;
            this.setState({ options: newOptions });
            this.setState({ transaction_for: "" });
            this.setState({ transaction_type: "consumer" });
        }
    }

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    handleSelectChange = (props, meta) => {
        const name = meta.name;
        const value = props.value;
        this.setState({ [name]: value });
    };

    handleDateChange = e => {
        // console.log(e.format('MM-DD-YYYY'))
        if (e.isValid) {
            const DATE = e.format();
            this.setState({ date_of_transaction: DATE }, console.log(this.state));
            this.setState({ isValidDate: true });
        } else {
            this.setState({ isValidDate: false });
            console.log("Date incorrect");
        }
    };

    handleCommodityGroupSelectChange = (props, meta) => {
        // const name = meta.name;
        const value = props.value;

        this.state.commodity_groups.map((commodity) => {
            // console.log(commodity)
            // console.log(commodity.commodity_group_name + " " + value)
            if (commodity._id === value) {
                this.setState({
                    sub_commodities: commodity.sub_commodities,
                    total:0,
                    discount : 0,
                    net_total : 0,                                
                })
                return null;
            }
            return null;
        })

        this.handleSelectChange(props, meta);

    }

    handleQuantityChange = e => {
        const index = e.target.id;
        const sub_commodity_transacted_quantity = e.target.value;
        if (!this.isMinCheckPassed(sub_commodity_transacted_quantity)) {
            return;
        }
        let sub_commodities = this.state.sub_commodities;
        sub_commodities[index].sub_commodity_transacted_quantity = sub_commodity_transacted_quantity;

        // Handle Price Auto Fill
        const sub_commodity_price_per_unit = sub_commodities[index].sub_commodity_price_per_unit;
        if (sub_commodity_price_per_unit !== undefined) {
            sub_commodities[index].sub_commodity_price = sub_commodity_transacted_quantity * sub_commodity_price_per_unit;
        }

        this.setState({ sub_commodities: sub_commodities }, this.handleTotalAutoFill())
    }

    handleTotalAutoFill = () => {
        let total = 0;
        this.state.sub_commodities.map(sub_commodity => {
            if (sub_commodity.sub_commodity_price > 0) {
                total += sub_commodity.sub_commodity_price;
            }
            return null;
        })

        const net_total = total - this.state.discount;

        this.setState({ total: total })
        this.setState({ net_total: net_total })
    }

    handlePricePerUnitChange = (e) => {
        const index = e.target.id;
        const sub_commodity_price_per_unit = e.target.value !== "" ? Math.round(e.target.value * 100) / 100 : "";
        if (!this.isMinCheckPassed(sub_commodity_price_per_unit)) {
            return;
        }
        const sub_commodity_transacted_quantity = this.state.sub_commodities[index].sub_commodity_transacted_quantity;
        let sub_commodities = this.state.sub_commodities;
        sub_commodities[index].sub_commodity_price_per_unit = sub_commodity_price_per_unit;

        // Handle Price Auto Fill  
        sub_commodities[index].sub_commodity_price = sub_commodity_transacted_quantity * sub_commodity_price_per_unit;
        sub_commodities[index].sub_commodity_price = Math.round(sub_commodities[index].sub_commodity_price * 100) / 100;
        this.setState({ sub_commodities: sub_commodities }, this.handleTotalAutoFill())
    }

    handleCommodityPriceChange = (e) => {
        const index = e.target.id;
        const sub_commodity_price = e.target.value !== "" ? Math.round(e.target.value * 100) / 100 : "";
        if (!this.isMinCheckPassed(sub_commodity_price)) {
            return;
        }
        let sub_commodities = this.state.sub_commodities;
        sub_commodities[index].sub_commodity_price = sub_commodity_price;
        // Handle Price Auto Fill  
        const sub_commodity_transacted_quantity = sub_commodities[index].sub_commodity_transacted_quantity;
        sub_commodities[index].sub_commodity_price_per_unit = sub_commodity_price / sub_commodity_transacted_quantity;
        sub_commodities[index].sub_commodity_price_per_unit = Math.round(sub_commodities[index].sub_commodity_price_per_unit * 100) / 100;
        this.setState({ sub_commodities: sub_commodities }, this.handleTotalAutoFill())
    }

    handleDiscountChange = (e) => {
        this.setState({ discount: e.target.value }, this.handleTotalAutoFill);
    }

    isMinCheckPassed = (number) => {
        if (number < 0) {
            this.props.enqueueSnackbar("Value can't be less than 0 !", {
                variant: "error"
            });
            return false;
        }
        return true;
    }

    // =======  Handler functions end  =======

    // ======= Life Cycle methods start =======

    componentDidMount = () => {
        let consumers = [];
        let suppliers = [];
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
        })

        Axios.get(`${CONSTANTS.SERVER_URL}/api/commodities/`).then(res => {
            if (res.data.length !== 0) {

                //For Storing Commodities
                let commodity_groups = []
                res.data.map(commodity_group => {
                    commodity_group.sub_commodities.map(sub_commodity => {
                        sub_commodity.sub_commodity_transacted_quantity = 0;
                        sub_commodity.sub_commodity_price_per_unit = 0;
                        sub_commodity.sub_commodity_price = 0;
                        return null;
                    })
                    commodity_groups.push(commodity_group)
                    return null;
                })
                this.setState({ commodity_groups: commodity_groups })
                //For Select Fields
                let commodity_groups_options = [];
                res.data.map(commodity => {
                    let c = {};
                    c.value = commodity._id;
                    c.label = commodity.commodity_group_name
                    commodity_groups_options.push(c)
                    return null;
                });
                let newOptions = this.state.options;
                newOptions.commodity_groups = commodity_groups_options;
                this.setState({ options: newOptions })
            }
        })
    };

    // =======  Life Cycle methods end  =======    

    constructCommodities = () => {
        return this.state.sub_commodities.map((sub_commodity, index) => {
            return (

                <Row key={index}>
                    <Col lg="3">
                        <FormGroup>
                            <label className="form-control-label">
                                Commodity name
                            </label>
                            <br />
                            {/* {commodity.sub_commodity_name} */}
                            <Input
                                id={index}
                                name="sub_commodity_name"
                                placeholder="Commodity name"
                                className="form-control-alternative"
                                type="text"
                                value={sub_commodity.sub_commodity_name}
                                autoComplete="off"
                                disabled={true}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="3">
                        <FormGroup>
                            <label className="form-control-label">
                                Commodity quantity
                            </label>
                            <br />
                            <InputGroup>
                                <Input
                                    
                                    id={index}
                                    // name="sub_commodity_name"
                                    placeholder="Quantity"
                                    // className="form-control-alternative"
                                    type="number"
                                    value={sub_commodity.sub_commodity_transacted_quantity}
                                    autoComplete="off"
                                    onChange={this.handleQuantityChange}
                                />
                                
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    <Col lg="3">
                        <FormGroup>
                            <label className="form-control-label">
                                Price / unit
                            </label>
                            <br />
                            <Input
                                id={index}
                                // name="sub_commodity_name"
                                placeholder="Commodity Price / unit"
                                className="form-control-alternative"
                                type="number"
                                value={sub_commodity.sub_commodity_price_per_unit}
                                autoComplete="off"
                                onChange={this.handlePricePerUnitChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="3">
                        <FormGroup>
                            <label className="form-control-label">
                                Commodity price
                            </label>
                            <br />
                            <Input
                                id={index}
                                name="sub_commodity_total"
                                placeholder="Commodity Total"
                                className="form-control-alternative"
                                type="number"
                                value={sub_commodity.sub_commodity_price}
                                autoComplete="off"
                                onChange={this.handleCommodityPriceChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            )
        })
    }

    render() {
        return (
            <>
                <CommonHeader />
                <div style={{ padding: "20px" }}>
                    <Row>
                        <Col className=" mt--7 order-xl-1" xl="12">
                            <Card className="bg-secondary shadow">
                                <CardHeader className="bg-white border-0">
                                    <Row className="align-items-center">
                                        <Col xs="8">
                                            <h3 className="mb-0">Transaction</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Transaction
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Transaction type
                                                        </label>
                                                        <br />
                                                        <Select
                                                            name="transaction_type"
                                                            placeholder="Transaction type..."
                                                            options={this.state.options.transaction_type}
                                                            onChange={this.handleTransactionTypeChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Transaction for
                                                        </label>
                                                        <br />
                                                        <Select
                                                            name="transaction_for"
                                                            placeholder="Transaction for..."
                                                            options={this.state.options.transaction_for}
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
                                                                    //value={this.state.date_of_transaction}
                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false} 
                                                                    // name="date_of_payment"
                                                                    onChange={this.handleDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>

                                    <hr />
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Commodities
                                        </h6>

                                        <Col lg="12">
                                            <FormGroup>
                                                <label className="form-control-label">
                                                    Commodity group
                                                </label>
                                                <br />
                                                <Select
                                                    name="commodity_group"
                                                    placeholder="Commodity group..."
                                                    options={this.state.options.commodity_groups}
                                                    onChange={this.handleCommodityGroupSelectChange}
                                                />
                                            </FormGroup>
                                        </Col>

                                        <div>

                                            {this.constructCommodities()}

                                        </div>

                                        <Row>
                                            <Col lg="3" />
                                            <Col lg="3" />
                                            <Col lg="3">
                                                Total
                                            </Col>
                                            <Col lg="3">
                                                <Input
                                                    disabled={true}
                                                    className="form-control-alternative"
                                                    name="discount"
                                                    autoComplete="off"
                                                    placeholder="Total"
                                                    type="number"
                                                    value={this.state.total}
                                                />
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col lg="3" />
                                            <Col lg="3" />
                                            <Col lg="3">
                                                Discount
                                            </Col>
                                            <Col lg="3">
                                                <Input
                                                    className="form-control-alternative"
                                                    name="discount"
                                                    autoComplete="off"
                                                    placeholder="Discount"
                                                    type="number"
                                                    value={this.state.discount}
                                                    onChange={this.handleDiscountChange}
                                                />
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col lg="3" />
                                            <Col lg="3" />
                                            <Col lg="3">
                                                Net Total
                                            </Col>
                                            <Col lg="3">
                                                <Input
                                                    disabled={true}
                                                    className="form-control-alternative"
                                                    // name="discount"
                                                    autoComplete="off"
                                                    placeholder="0"
                                                    type="number"
                                                    value={this.state.net_total}
                                                />
                                            </Col>
                                        </Row>

                                    </Form>

                                    <hr className="my-4" />
                                    {/* Description */}
                                    <h6 className="heading-small text-muted mb-4">
                                        Transaction Description
                                        </h6>
                                    <div className="pl-lg-4">
                                        <FormGroup>
                                            <Input
                                                className="form-control-alternative"
                                                rows="4"
                                                placeholder="Description about this Transaction (optional)"
                                                type="textarea"
                                                name="transaction_description"
                                                onChange={this.handleChange}
                                            />
                                        </FormGroup>
                                    </div>


                                </CardBody>
                                <CardFooter>
                                    <Button color="info" onClick={this.handleSubmit}>
                                        Save Transaction
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Redirect on submit */}
                {this.state.isTransactionSuccess ? <Redirect to="/admin/transactions" /> : null}

            </>
        );
    }
}

export default withSnackbar(AddTransaction);
