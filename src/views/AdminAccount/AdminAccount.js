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
import CommonHeader from "../../components/Headers/CommonHeader.js";
import CONSTANTS from "../../variables/general.js"
import { withSnackbar } from "notistack";
import { Redirect } from "react-router-dom";

class AccountAccount extends React.Component {
    state = {
        _id: "",
        email_id: "",
        isAccountEdited: false,
        isEditMode: false,
        user_name: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
        phone: "",
        bank_accounts: [
            {
                account_no: "",
                account_holder_name: "",
                ifsc: "",
                bank: "",
            }
        ],
        isSubmitBtnDisabled: false
    };


    onSubmit = (e) => {
        e.preventDefault();
        const accountData = {
            user_name: this.state.user_name,
            address: this.state.address,
            district: this.state.district,
            state: this.state.state,
            pincode: this.state.pincode,
            phone: this.state.phone,
            // email_id: this.state.email_id,
            bank_accounts: this.state.bank_accounts
        }
        if (accountData.user_name === "") {
            this.props.enqueueSnackbar("Account Name field is mandatory !", {
                variant: "error"
            });
            return;
        }
        if (accountData.phone === "") {
            this.props.enqueueSnackbar("Phone Number is field is mandatory !", {
                variant: "error"
            });
            return;
        }

        //email-Id Validation
        // if (accountData.email_id.length > 0 && accountData.email_id.lastIndexOf('@') === -1) {
        //     this.props.enqueueSnackbar("Enter Valid Mail-Id !", {
        //         variant: "error"
        //     });
        //     return;
        // }

        if (this.state.isSubmitBtnDisabled) {
            return;
        }
        this.setState({ isSubmitBtnDisabled: true })
        Axios.post(`${CONSTANTS.SERVER_URL}/api/admins/update/` + this.state._id, accountData)
            .then(res => {
                this.setState({ isSubmitBtnDisabled: false })
                this.setState({ isEditMode: false })
                this.props.enqueueSnackbar(
                    "Account Updated Successfully",
                    {
                        variant: "success"
                    })
            })
            .catch(err => {
                this.setState({ isEditMode: true })
                this.setState({ isSubmitBtnDisabled: false })
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!") : "Something went wrong!",
                    {
                        variant: "warning"
                    }
                );
            })
    }

    handleElementChange = (props) => {
        this.setState({ [props.target.name]: props.target.value });
    }

    handleAddBank = () => {
        let bank_accounts = this.state.bank_accounts;
        bank_accounts.push({
            bank: "",
            account_no: "",
            account_holder_name: "",
            ifsc: ""
        });
        this.setState({ bank_accounts: bank_accounts });
    };

    handleRemoveBank = e => {
        const index = e.target.name;
        let bank_accounts = [];
        bank_accounts = this.state.bank_accounts;
        bank_accounts.splice(index, 1);
        this.setState({ bank_accounts: bank_accounts });
    };

    handleCardChange = e => {
        const index = e.target.id;
        const bank_account = e.target.name;
        let bank_accounts = this.state.bank_accounts;
        if (bank_account === "bank") {
            bank_accounts[index].bank = e.target.value;
        } else if (bank_account === "account_no") {
            bank_accounts[index].account_no = e.target.value;
        } else if (bank_account === "account_holder_name") {
            bank_accounts[index].account_holder_name = e.target.value;
        } else if (bank_account === "ifsc") {
            bank_accounts[index].ifsc = e.target.value;
        }
        this.setState({ bank_accounts: bank_accounts });
    };

    //TODO have to remove in cloud version 
    componentDidMount = () => {
        Axios.get(`${CONSTANTS.SERVER_URL}/api/admins/`)
            .then(account => {
                console.log(account)
                this.setState({
                    _id: account.data[0]._id,
                    email_id: account.data[0].email_id,
                    user_name: account.data[0].user_name,
                    address: account.data[0].address,
                    district: account.data[0].district,
                    state: account.data[0].state,
                    pincode: account.data[0].pincode,
                    phone: account.data[0].phone,
                    bank_accounts: account.data[0].bank_accounts
                }, console.log(this.state))
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

    constructBankDetails = () => {
        return this.state.bank_accounts.map((bank_account, index) => {
            return (
                <>
                    <div key={index}>
                        <Row>
                            <Col className="order-xl-1" xl="12">
                                <Card className="bg-secondary shadow">
                                    <CardHeader className="bg-white border-0">
                                        <Row className="align-items-center">
                                            <Col xs="8">
                                                <h3 className="mb-0">Bank Account {index + 1} </h3>
                                            </Col>
                                            <Col className="text-right">
                                                {this.state.isEditMode && <Button
                                                    name={index}
                                                    index={index}
                                                    color="danger"
                                                    onClick={this.handleRemoveBank}
                                                    size="sm"
                                                >
                                                    - remove
                                                </Button>}
                                            </Col>
                                        </Row>
                                    </CardHeader>
                                    <CardBody>
                                        <Form>
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
                                                                disabled={!this.state.isEditMode}
                                                                id={index}
                                                                className="form-control-alternative"
                                                                placeholder="Account No"
                                                                type="text"
                                                                name="account_no"
                                                                value={bank_account.account_no}
                                                                onChange={this.handleCardChange}
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
                                                                disabled={!this.state.isEditMode}
                                                                id={index}
                                                                className="form-control-alternative"
                                                                placeholder="Account Holder Name"
                                                                type="text"
                                                                name="account_holder_name"
                                                                value={bank_account.account_holder_name}
                                                                onChange={this.handleCardChange}
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
                                                                disabled={!this.state.isEditMode}
                                                                id={index}
                                                                className="form-control-alternative"
                                                                placeholder="IFSC"
                                                                type="text"
                                                                name="ifsc"
                                                                value={bank_account.ifsc}
                                                                onChange={this.handleCardChange}
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
                                                                disabled={!this.state.isEditMode}
                                                                id={index}
                                                                className="form-control-alternative"
                                                                placeholder="Bank"
                                                                type="text"
                                                                name="bank"
                                                                value={bank_account.bank}
                                                                onChange={this.handleCardChange}
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
                </>
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
                                            <h3 className="mb-0">Account</h3>
                                        </Col>
                                        <Col className="text-right">
                                            <Button
                                                color="default"
                                                onClick={() => { this.setState({ isEditMode: true }) }}
                                                size="sm"
                                            >
                                                <span className="btn-inner--icon">
                                                    <i className="ni ni-bold-right" />
                                                </span>
                                                <span className="btn-inner--text">Edit</span>

                                            </Button>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4">
                                            Account information
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="6">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-account-name"
                                                        >
                                                            Account Name
                                                        </label>
                                                        <br />
                                                        <Input
                                                            disabled={!this.state.isEditMode}
                                                            id="input-account-name"
                                                            className="form-control-alternative"
                                                            placeholder="Account Name"
                                                            name="user_name"
                                                            type="text"
                                                            value={this.state.user_name}
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
                                                            disabled={!this.state.isEditMode}
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
                                                            disabled={!this.state.isEditMode}
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
                                                            disabled={!this.state.isEditMode}
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
                                                            disabled={!this.state.isEditMode}
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
                                                            disabled={!this.state.isEditMode}
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
                                                            disabled={true}
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
                                        </div>

                                        <hr className="my-4" />
                                        {/* Description */}
                                        <h6 className="heading-small text-muted mb-4">
                                            Bank Details
                                        </h6>
                                        {this.constructBankDetails()}

                                        {this.state.isEditMode && <Row className="align-items-center">
                                            <Col className="text-right">
                                                <Button
                                                    color="primary"
                                                    onClick={this.handleAddBank}
                                                    size="sm"
                                                >
                                                    + new bank account
                                            </Button>
                                            </Col>
                                        </Row>
                                        }
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    {this.state.isEditMode && <>
                                        <Button
                                            disabled={this.state.isSubmitBtnDisabled}
                                            color="success"
                                            onClick={this.onSubmit}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            disabled={this.state.isSubmitBtnDisabled}
                                            color="danger"
                                            onClick={() => { this.setState({ isEditMode: false }) }}
                                        >
                                            Cancel
                                    </Button>
                                    </>
                                    }
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                {this.state.isAccountAdded ? <Redirect to="/account/accounts" /> : null}
            </>
        );
    }
}

export default withSnackbar(AccountAccount);