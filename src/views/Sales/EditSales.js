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

class EditSales extends React.Component {

    state = {
        _id: new URLSearchParams(this.props.location.search).get("id"),
        sales_for: "",                  // consumer id
        commodity_group: "",            // id
        date_of_sales: "",
        total: 0,
        metric_ton: "",
        discount_per_metric_ton: "",
        discount: 0,
        net_total: 0,
        sales_description: "",
        invoice_no: "",
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
            sales_for: [],
            buffer: {
                consumers: [],
                suppliers: []
            }
        },
        isSalesSuccess: false,
        isSubmitBtnDisabled: false
    }

    // ======= Handler functions start =======

    handleSubmit = e => {
        let payload = {};

        payload.sales_for = this.state.sales_for;
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

        payload.date_of_sales = this.state.date_of_sales;
        payload.total = this.state.total;
        payload.metric_ton = (this.state.metric_ton === "") ? 0 : this.state.metric_ton;
        payload.discount_per_metric_ton = (this.state.discount_per_metric_ton === "") ? 0 : this.state.discount_per_metric_ton;
        payload.discount = this.state.discount;
        payload.net_total = this.state.net_total;

        if (payload.sales_for === "") {
            this.props.enqueueSnackbar("Sales for is mandatory !", {
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
        payload.sales_description = this.state.sales_description;

        //Disable submit button
        this.setState({ isSubmitBtnDisabled: true })

        Axios.post(`${CONSTANTS.SERVER_URL}/api/sales/update/${this.state._id}`, payload)
            .then(res => {
                console.log(res);
                this.props.enqueueSnackbar(
                    `Sales edited successfully`,
                    {
                        variant: "success"
                    }
                );
                this.setState({ isSalesSuccess: true })
            })
            .catch(err => {
                //Enable submit Button
                this.setState({ isSubmitBtnDisabled: false })
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
                console.log(err);
            });
    };

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
            this.setState({ date_of_sales: DATE }, console.log(this.state));
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
                    total: 0,
                    discount_per_metric_ton: 0,
                    discount: 0,
                    net_total: 0,
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
        sub_commodities[index].sub_commodity_quantity = sub_commodity_transacted_quantity;
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

    handleMetricTonChange = (e) => {
        const metric_ton = e.target.value !== "" ? Math.round(e.target.value * 100) / 100 : "";
        if (!this.isMinCheckPassed(metric_ton)) {
            return;
        }
        this.setState({ metric_ton: metric_ton })
        if (this.state.discount_per_metric_ton !== "" && this.state.discount_per_metric_ton !== 0) {
            let discount = metric_ton * this.state.discount_per_metric_ton;
            discount = Math.round(discount * 100) / 100
            this.setState({ discount: discount }, this.handleTotalAutoFill)
        }
        else if (this.state.discount !== "" && this.state.discount !== 0) {
            const discount_per_metric_ton = Math.round((this.state.discount / metric_ton) * 100) / 100;
            this.setState({ discount_per_metric_ton: discount_per_metric_ton });
        }
    }

    handleDiscountPerMatricTonChange = (e) => {
        const discount_per_metric_ton = e.target.value !== "" ? Math.round(e.target.value * 100) / 100 : "";
        if ((this.state.metric_ton === "" || this.state.matric_ton === 0) && (this.state.discount_per_metric_ton === "" || this.state.discount_per_metric_ton === 0)) {
            this.props.enqueueSnackbar(
                `Fill "Metric Ton" field before filling Discount per metric ton`,
                {
                    variant: "warning"
                }
            );
            return;
        }
        if (!this.isMinCheckPassed(discount_per_metric_ton)) {
            return;
        }

        this.setState({ discount_per_metric_ton: discount_per_metric_ton })
        const discount = this.state.metric_ton * discount_per_metric_ton;
        this.setState({ discount: discount }, this.handleTotalAutoFill)
    }

    handleDiscountChange = (e) => {
        const discount = e.target.value !== "" ? Math.round(e.target.value * 100) / 100 : "";

        if (this.state.metric_ton !== "" && this.state.metric_ton !== 0) {
            const discount_per_metric_ton = Math.round((discount / this.state.metric_ton) * 100) / 100;
            this.setState({ discount_per_metric_ton: discount_per_metric_ton })
        }

        this.setState({ discount: discount }, this.handleTotalAutoFill);
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

        Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/`).then(res => {
            if (res.data.length !== 0) {
                res.data.map(consumer => {
                    let c = {};
                    c.value = consumer._id;
                    c.label = consumer.user_name;
                    consumers.push(c)
                    return null;
                });
                let newOptions = this.state.options;
                newOptions.sales_for = consumers;
                this.setState({ options: newOptions })
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

        Axios.get(`${CONSTANTS.SERVER_URL}/api/sales/` + this.state._id)
            .then(response => {
                let date_of_sales = new Date(response.data.date_of_sales);
                this.setState({
                    sales_for: response.data.sales_for,                       // consumer id
                    commodity_group: response.data.commodity_group,           // id
                    date_of_sales: date_of_sales,
                    total: response.data.total,
                    metric_ton: response.data.metric_ton,
                    discount_per_metric_ton: response.data.discount_per_metric_ton,
                    discount: response.data.discount,
                    net_total: response.data.net_total,
                    sales_description: response.data.sales_description,
                    sub_commodities: response.data.sub_commodities,
                    invoice_no: response.data.invoice_no
                });
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
                                    placeholder="Quantity"
                                    className="form-control-alternative"
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
                                            <h3 className="mb-0">Edit Sales</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Sales
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="12">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Sales for
                                                        </label>
                                                        <br />
                                                        <Select
                                                            name="sales_for"
                                                            placeholder="Sales for..."
                                                            options={this.state.options.sales_for}
                                                            value={{
                                                                value: this.state.sales_for,
                                                                label: this.getOptionLabel(this.state.sales_for, "sales_for", "value", "label"),
                                                            }}
                                                            onChange={this.handleSelectChange}
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
                                                                        placeholder: "Payment date",
                                                                        disabled: true
                                                                    }}
                                                                    utc={true}
                                                                    value={this.state.date_of_sales}
                                                                    dateFormat="DD-MM-YYYY"
                                                                    timeFormat={false}
                                                                    onChange={this.handleDateChange}
                                                                />
                                                            </InputGroup>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <label className="form-control-label">
                                                        Invoice No
                                                </label>
                                                    <Input
                                                        disabled={true}
                                                        className="form-control-alternative"
                                                        // name="discount"
                                                        autoComplete="off"
                                                        // placeholder="Total"
                                                        type="text"
                                                        value={this.state.invoice_no}
                                                    />
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
                                                    value={{
                                                        value: this.state.commodity_group,
                                                        label: this.getOptionLabel(this.state.commodity_group, "commodity_groups", "value", "label")
                                                    }}
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
                                                {/* Total */}
                                            </Col>
                                            <Col lg="3">
                                                <label className="form-control-label">
                                                    Total
                                                </label>
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
                                            <Col lg="3">
                                                <label className="form-control-label">
                                                    Metric Ton
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="metric_ton"
                                                    autoComplete="off"
                                                    placeholder="Metric Ton"
                                                    type="number"
                                                    value={this.state.metric_ton}
                                                    onChange={this.handleMetricTonChange}
                                                />
                                            </Col>
                                            <Col lg="3">
                                                <label className="form-control-label">
                                                    Discount per Metric Ton
                                                </label>
                                                <Input
                                                    className="form-control-alternative"
                                                    name="discount_per_metric_ton"
                                                    autoComplete="off"
                                                    placeholder="Discount Per Metric Ton"
                                                    type="number"
                                                    value={this.state.discount_per_metric_ton}
                                                    onChange={this.handleDiscountPerMatricTonChange}
                                                />
                                            </Col>
                                            <Col lg="3">
                                                <label className="form-control-label">
                                                    Discount
                                                </label>
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
                                                {/* Net Total */}
                                            </Col>
                                            <Col lg="3">
                                                <label className="form-control-label">
                                                    Net Total
                                                </label>
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
                                        Sales Description
                                        </h6>
                                    <div className="pl-lg-4">
                                        <FormGroup>
                                            <Input
                                                className="form-control-alternative"
                                                rows="4"
                                                placeholder="Description about this Sales (optional)"
                                                type="textarea"
                                                name="sales_description"
                                                onChange={this.handleChange}
                                            />
                                        </FormGroup>
                                    </div>


                                </CardBody>
                                <CardFooter>
                                    <Button disabled={this.state.isSubmitBtnDisabled} color="info" onClick={this.handleSubmit}>
                                        Save Sales
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Redirect on submit */}
                {this.state.isSalesSuccess ? <Redirect to="/admin/sales" /> : null}

            </>
        );
    }
}

export default withSnackbar(EditSales);
