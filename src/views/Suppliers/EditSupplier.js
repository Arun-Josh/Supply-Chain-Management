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
import Axios from "axios";
import { withSnackbar } from "notistack";
import CommonHeader from "../../components/Headers/CommonHeader.js";
import CONSTANTS from "../../variables/general.js"
import { Redirect } from "react-router-dom";

class EditSuppliers extends React.Component {
    state = {
        _id: new URLSearchParams(this.props.location.search).get("id"),
        isSupplierEdited: false,
        options: {

            commodityGroup: [
                {
                    value: "commodity1",
                    label: "Commodity 1"
                },
                {
                    value: "commodity2",
                    label: "Commodity 2"
                }
            ],
        },
        showBankDeatils: false,
        commoditygroup: "",
        user_name: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
        phone: "",
        email_id: "",
        account_no: "",
        account_holder_name: "",
        ifsc: "",
        bank: "",
        balance: 0,
        isSubmitBtnDisabled: false
    };

    componentDidMount() {
        Axios.get(`${CONSTANTS.SERVER_URL}/api/suppliers/` + this.state._id).then(response => {
            this.setState({


                user_name: response.data.user_name,
                address: response.data.address,
                district: response.data.district,
                state: response.data.state,
                pincode: response.data.pincode,
                phone: response.data.phone,
                email_id: response.data.email_id,
                account_no: response.data.account_no,
                account_holder_name: response.data.account_holder_name,
                ifsc: response.data.ifsc,
                bank: response.data.bank,
                balance: response.data.balance
            })
            if (this.state.account_no !== "") {
                this.setState({ showBankDeatils: true })
            }
        }).catch((err) => {
            this.props.enqueueSnackbar(
                err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                {
                    variant: "warning"
                }
            );
        })
    }


    handleCommodityGroupChange = (props) => {
        this.setState({ commoditygroup: props.value })
    }
    handleElementChange = (props) => {
        this.setState({ [props.target.name]: props.target.value });
    }
    onClick = () => {
        this.setState({ showBankDeatils: !this.state.showBankDeatils });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const addsupplier = {


            user_name: this.state.user_name,
            address: this.state.address,
            district: this.state.district,
            state: this.state.state,
            pincode: this.state.pincode,
            phone: this.state.phone,
            email_id: this.state.email_id,
            account_no: this.state.account_no,
            account_holder_name: this.state.account_holder_name,
            ifsc: this.state.ifsc,
            bank: this.state.bank,
            balance: this.state.balance

        }
        if (addsupplier.user_name === "") {
            this.props.enqueueSnackbar("Supplier name field is mandatory !", {
                variant: "error"
            });
            return;
        }
        else if (addsupplier.phone === "") {
            this.props.enqueueSnackbar("Phone Number is field is mandatory !", {
                variant: "error"
            });
            return;
        }

        else if (isNaN(addsupplier.phone)) {
            this.props.enqueueSnackbar("Enter Valid Phone Number", {
                variant: "error"
            });
            return;
        }
        //email-Id Validation
        else if (addsupplier.email_id.length > 0 && addsupplier.email_id.lastIndexOf('@') === -1) {
            this.props.enqueueSnackbar("Enter Valid Mail-Id !", {
                variant: "error"
            });
            return;
        }
        this.setState({ isSubmitBtnDisabled: true })
        Axios.post(`${CONSTANTS.SERVER_URL}/api/suppliers/update/` + this.state._id, addsupplier)
            .then(setTimeout(() => (this.setState({ isSupplierEdited: true })), 1000)).then(res => {
                this.props.enqueueSnackbar(
                    "Supplier Updated Successfully",
                    {
                        variant: "success"
                    })
            })
            .catch((err) => {
                this.setState({ isSubmitBtnDisabled: false })
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
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
                                            <h3 className="mb-0">Supplier</h3>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Supplier information
                    </h6>
                                        <div className="pl-lg-4">

                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-supplier-name"
                                                        >
                                                            Supplier Name
                            </label>
                                                        <br />
                                                        <Input
                                                            id="input-supplier-name"
                                                            className="form-control-alternative"
                                                            placeholder="Supplier Name"
                                                            name="user_name"
                                                            value={this.state.user_name}
                                                            type="text"
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-address"
                                                        >
                                                            Address
                            </label>
                                                        <Input
                                                            id="input-address"
                                                            className="form-control-alternative"
                                                            placeholder="Address"
                                                            type="text"
                                                            name="address"
                                                            value={this.state.address}
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-district"
                                                        >
                                                            District
                            </label>
                                                        <Input
                                                            id="input-district"
                                                            className="form-control-alternative"
                                                            placeholder="District"
                                                            type="text"
                                                            name="district"
                                                            value={this.state.district}
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-state"
                                                        >
                                                            State
                            </label>
                                                        <Input
                                                            id="input-state"
                                                            className="form-control-alternative"
                                                            placeholder="State"
                                                            type="text"
                                                            name="state"
                                                            value={this.state.state}
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-pincode"
                                                        >
                                                            Pincode
                            </label>
                                                        <Input
                                                            id="input-pincode"
                                                            className="form-control-alternative"
                                                            placeholder="Pincode"
                                                            type="text"
                                                            name="pincode"
                                                            value={this.state.pincode}
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
                                                            htmlFor="input-phone"
                                                        >
                                                            Phone
                            </label>
                                                        <br />
                                                        <Input
                                                            id="input-phone"
                                                            className="form-control-alternative"
                                                            placeholder="Phone No."
                                                            type="text"
                                                            name="phone"
                                                            value={this.state.phone}
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-email-id"
                                                        >
                                                            E-mail Id
                            </label>
                                                        <br />
                                                        <Input
                                                            id="input-email-id"
                                                            className="form-control-alternative"
                                                            placeholder="E-mail"
                                                            type="text"
                                                            name="email_id"
                                                            value={this.state.email_id}
                                                            onChange={this.handleElementChange}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                            </Row>
                                            <Row className="my-4">
                                                <Col xs="12">
                                                    <div className="custom-control custom-control-alternative custom-checkbox">
                                                        <input
                                                            className="custom-control-input"
                                                            id="customCheckRegister"
                                                            type="checkbox"
                                                            onClick={this.onClick}
                                                        />
                                                        <label
                                                            className="custom-control-label"
                                                            htmlFor="customCheckRegister"
                                                        >
                                                            <span className="text-muted">
                                                                Add Bank Detais
                                                            </span>
                                                        </label>
                                                    </div>
                                                </Col>
                                            </Row>

                                        </div>
                                        {this.state.showBankDeatils ? <BankDetails account_no={this.state.account_no} account_holder_name={this.state.account_holder_name} ifsc={this.state.ifsc} bank={this.state.bank} handleElementChange={this.handleElementChange} /> : null}
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button
                                        disabled={this.state.isSubmitBtnDisabled}
                                        color="info"
                                        onClick={this.onSubmit}
                                    >
                                        Update
                </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                {this.state.isSupplierEdited ? <Redirect to="/admin/suppliers" /> : null}
            </>
        );
    }
}



class BankDetails extends React.Component {
    render() {
        return (
            <div className="pl-lg-4">
                <Row>

                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-account-no"
                            >
                                Account No
                            </label>
                            <br />
                            <Input
                                id="input-account-no"
                                className="form-control-alternative"
                                placeholder="Account No"
                                type="text"
                                name="account_no"
                                value={this.props.account_no}
                                onChange={this.props.handleElementChange}
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
                                id="input-account-holder-name"
                                className="form-control-alternative"
                                placeholder="Account Holder Name"
                                type="text"
                                name="account_holder_name"
                                value={this.props.account_holder_name}
                                onChange={this.props.handleElementChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>

                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-ifsc"
                            >
                                IFSC
                            </label>
                            <br />
                            <Input
                                id="input-ifsc"
                                className="form-control-alternative"
                                placeholder="IFSC"
                                type="text"
                                name="ifsc"
                                value={this.props.ifsc}
                                onChange={this.props.handleElementChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col lg="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="input-bank"
                            >
                                Bank
                            </label>
                            <br />
                            <Input
                                id="input-bank"
                                className="form-control-alternative"
                                placeholder="Bank"
                                type="text"
                                name="bank"
                                value={this.props.bank}
                                onChange={this.props.handleElementChange}
                            />
                        </FormGroup>
                    </Col>

                </Row>

            </div>
        );
    }
}

export default withSnackbar(EditSuppliers);