import React from "react";

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
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
import CONSTANTS from "./../../variables/general.js";
import { Redirect } from "react-router-dom";

class AddCommodity extends React.Component {
    state = {
        commodity_group_name: "",
        sub_commodities: [
            {
                sub_commodity_name: "",
                sub_commodity_quantity: "",
                sub_commodity_unit: "Kilo gram"
            }
        ],
        options: {
            sub_commodity_unit: [
                {
                    value: "Kilo gram",
                    label: "Kilo gram"
                },
                {
                    value: "Gram",
                    label: "Gram"
                },
                {
                    value: "Liter",
                    label: "Liter"
                },
                // {
                //     value: "pack",
                //     label: "pack"
                // },
                {
                    value: "Piece",
                    label: "Piece"
                }
            ]
        },
        isCommoditySuccess: false,
        isSubmitBtnDisabled: false
    };

    // ======= Handler functions start =======

    handleSubmit = e => {
        let payload = {};
        payload.commodity_group_name = this.state.commodity_group_name;
        payload.sub_commodities = this.state.sub_commodities;

        if (payload.sub_commodities.length === 0) {
            this.props.enqueueSnackbar("Atleast 1 quantity needed !", {
                variant: "error"
            });
            return;
        }

        if (payload.commodity_group_name === "") {
            this.props.enqueueSnackbar("Commodity group field is mandatory !", {
                variant: "error"
            });
            return;
        }
        let stopFlag = false;
        payload.sub_commodities.map((commodity, index) => {
            commodity.sub_commodity_name = commodity.sub_commodity_name + "( " + commodity.sub_commodity_quantity + " " + commodity.sub_commodity_unit + " )";
            if (commodity.sub_commodity_name === "") {
                this.props.enqueueSnackbar(
                    `Commodity ${index + 1} name field is empty !`,
                    {
                        variant: "error"
                    }
                );
                stopFlag = true;
                return null;
            }

            if (commodity.sub_commodity_quantity === "") {
                this.props.enqueueSnackbar(
                    `Commodity ${index + 1} quantity field is empty !`,
                    {
                        variant: "error"
                    }
                );
                stopFlag = true;
                return null;
            }

            if (commodity.sub_commodity_unit === "") {
                this.props.enqueueSnackbar(
                    `Commodity ${index + 1} unit field is empty !`,
                    {
                        variant: "error"
                    }
                );
                stopFlag = true;
                return null;
            }

            return null;
        });

        if (stopFlag) {
            return;
        }
        this.setState({ isSubmitBtnDisabled: true })
        Axios.post(`${CONSTANTS.SERVER_URL}/api/commodities/add`, payload)
            .then(res => {
                console.log(res);
                if (res.data === "success") {
                    this.props.enqueueSnackbar(
                        "Commodities successfully added",
                        {
                            variant: "success"
                        }
                    );
                    this.setState({ isCommoditySuccess: true })
                }
                else if (res.data === "duplicate") {
                    this.props.enqueueSnackbar(
                        "Commodity group name already found, Please provide a new commodity group name !",
                        {
                            variant: "error"
                        }
                    );
                }
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

    handleChange = e => {
        // console.log(e.target.name + " "+ e.target.value)
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    handleAddCommodity = () => {
        let new_sub_commodities = this.state.sub_commodities;
        new_sub_commodities.push({
            sub_commodity_name: "",
            sub_commodity_quantity: "",
            sub_commodity_unit: "Kilo gram"
        });
        this.setState({ sub_commodities: new_sub_commodities });
    };

    handleCardChange = e => {
        const index = e.target.id;
        const sub_commodity_name = e.target.name;
        let sub_commodities = this.state.sub_commodities;
        if (sub_commodity_name === "sub_commodity_name") {
            sub_commodities[index].sub_commodity_name = e.target.value;
        } else if (sub_commodity_name === "sub_commodity_quantity") {
            sub_commodities[index].sub_commodity_quantity = e.target.value;
        }
        this.setState({ sub_commodities: sub_commodities });
    };

    handleRemoveCommodity = e => {
        const index = e.target.name;
        let new_sub_commodities = [];
        new_sub_commodities = this.state.sub_commodities;
        new_sub_commodities.splice(index, 1);
        this.setState({ sub_commodities: new_sub_commodities });
    };

    handleCardSelectChange = (props, meta) => {
        const index = meta.name;
        const value = props.value;

        let sub_commodities = this.state.sub_commodities;
        sub_commodities[index].sub_commodity_unit = value;
        this.setState({ sub_commodities: sub_commodities });
    };

    // =======  Handler functions end  =======

    constructQuantityCards = () => {
        return this.state.sub_commodities.map((commodity, index) => {
            return (
                <div key={index} >
                    <Row>
                        <Col className="order-xl-1" xl="12">
                            <Card className="bg-secondary shadow">
                                <CardHeader className="bg-white border-0">
                                    <Row className="align-items-center">
                                        <Col xs="8">
                                            <h3 className="mb-0">Commodity {index + 1} </h3>
                                        </Col>
                                        <Col className="text-right">
                                            <Button
                                                name={index}
                                                index={index}
                                                color="danger"
                                                onClick={this.handleRemoveCommodity}
                                                size="sm"
                                            >
                                                - remove
                                            </Button>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Commodity name
                                                        </label>
                                                        <br />
                                                        <Input
                                                            id={index}
                                                            name="sub_commodity_name"
                                                            placeholder="Commodity name"
                                                            className="form-control-alternative"
                                                            type="text"
                                                            value={this.state.sub_commodities[index].sub_commodity_name}
                                                            autoComplete="off"
                                                            onChange={this.handleCardChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Commodity Quantity
                                                        </label>
                                                        <br />
                                                        <Input
                                                            id={index}
                                                            name="sub_commodity_quantity"
                                                            placeholder="Commodity quantity"
                                                            className="form-control-alternative"
                                                            type="number"
                                                            value={this.state.sub_commodities[index].sub_commodity_quantity}
                                                            autoComplete="off"
                                                            onChange={this.handleCardChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Commodity Unit
                                                        </label>
                                                        <Select
                                                            name={index}
                                                            placeholder="Choose unit..."
                                                            value={[{ value: this.state.sub_commodities[index].sub_commodity_unit, label: this.state.sub_commodities[index].sub_commodity_unit }]}
                                                            options={this.state.options.sub_commodity_unit}
                                                            onChange={this.handleCardSelectChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>
                                </CardBody>
                                <CardFooter></CardFooter>
                            </Card>
                        </Col>
                    </Row>

                    <br />
                </div>
            );
        });
    };

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
                                            <h3 className="mb-0">Commodities</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Commodity Group
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label className="form-control-label">
                                                            Commodity group name
                            </label>
                                                        <br />
                                                        <Input
                                                            name="commodity_group_name"
                                                            placeholder="Commodity group name"
                                                            className="form-control-alternative"
                                                            type="text"
                                                            autoComplete="off"
                                                            onChange={this.handleChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>

                                    {this.constructQuantityCards()}

                                    <Row className="align-items-center">
                                        <Col className="text-right">
                                            <Button
                                                color="primary"
                                                onClick={this.handleAddCommodity}
                                                size="sm"
                                            >
                                                + new commodity
                      </Button>
                                        </Col>
                                    </Row>
                                </CardBody>
                                <CardFooter>
                                    <Button disabled={this.state.isSubmitBtnDisabled} color="info" onClick={this.handleSubmit}>
                                        Save Commodity
                  </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Redirect on submit */}
                {this.state.isCommoditySuccess ? <Redirect to="/admin/commodities" /> : null}

            </>
        );
    }
}

export default withSnackbar(AddCommodity);
