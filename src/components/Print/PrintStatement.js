import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Row, Col } from "reactstrap";
import Axios from "axios";
import CONSTANTS from "../../variables/general.js";

class PrintStatement extends React.Component {

    state = {
        admin_name: "",
        user: {
            user_name: "",
        },
        from: "",
        to: "",
        data: [],
        opening_balance: "",
        closing_balance: ""
    }

    componentDidMount = () => {
        // console.log(this.props)
        if (this.props.user_id !== "") {
            this.getUserData();
        }

        Axios.get(`${CONSTANTS.SERVER_URL}/api/admins`)
            .then(res => {
                if(!res.data[0])
                {
                    this.props.enqueueSnackbar(
                        "NO RESULT",
                        {
                    variant:"success"
                        }
                    );
                }
                else{
                const admin_name = res.data[0].user_name;
                this.setState({ admin_name })
                }
            })
            .catch(err => {
                this.props.enqueueSnackbar(
                    err.response !== undefined ? (err.response.data.message !== undefined ? err.response.data.message : "Something went wrong!!!!!!!") : "Something went wrong!!!!",
                    {
                        variant: "warning"
                    }
                );
            });

        if (this.props.data.length > 0) {
            this.setState({ opening_balance: this.props.data[0].opening_balance })
            this.setState({ closing_balance: this.props.data[this.props.data.length - 1].closing_balance })
        }

        let data = []
        this.props.data.map(row => {
            let particulars = [];
            row.particulars.map(particular => {
                return particulars.push(<div> {particular.sub_commodity_name + " " + particular.sub_commodity_quantity}</div>);
            });
            row["particulars"] = particulars;
            let date = "";
            date += new Date(row.date_of_transaction).getDate() + "-"
            date += new Date(row.date_of_transaction).getMonth() + "-"
            date += new Date(row.date_of_transaction).getFullYear()
            row.date_of_transaction = date;
            return data.push(row);
        })
        this.setState({ data })
        let from = "";
        from += new Date(this.props.from).getDate() + "-"
        from += new Date(this.props.from).getMonth() + "-"
        from += new Date(this.props.from).getFullYear()
        this.setState({ from });
        let to = "";
        to += new Date(this.props.to).getDate() + "-"
        to += new Date(this.props.to).getMonth() + "-"
        to += new Date(this.props.to).getFullYear()
        this.setState({ to });
    }

    getUserData = () => {
        Axios.get(`${CONSTANTS.SERVER_URL}/api/consumers/${this.props.user_id}`)
            .then(res => {
                this.setState({ user: res.data })
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

    render() {
        return (
            <div>
                <br />
                <Row>
                    <Col xs="4" />
                    <Col xs="4" align="center">
                        <h3>{this.state.admin_name}</h3>
                    </Col>
                    <Col xs="4" />
                </Row>
                <Row align="center">
                    <Col xs="12">
                        <h1 className="mb-0">
                            {this.props.user_id === "" ? "STATEMENT" :
                                this.state.user.user_name.toLocaleUpperCase() + "'s STATEMENT"
                            }
                        </h1>
                    </Col>
                </Row>
                <Row align="center">
                    <Col xs="12">
                        <h3 className="mb-0">{this.state.from} TO {this.state.to}</h3>
                    </Col>
                </Row>
                <div style={{ padding: "50px" }}>
                    <Row>
                        {this.props.user_id === "" ? <Col xs="4" /> :
                            <>
                                <Col xs="4">
                                    <Row>
                                        Address :
                                </Row>
                                    <Row>
                                        {this.state.user.user_name}
                                    </Row>
                                    <Row>
                                        {this.state.user.address}
                                    </Row>
                                    <Row>
                                        {this.state.user.district}
                                    </Row>
                                    <Row>
                                        {this.state.user.state}
                                    </Row>
                                    <Row>
                                        {this.state.user.pincode}
                                    </Row>
                                    <Row>
                                        {"PHONE NO : " + this.state.user.phone}
                                    </Row>
                                </Col>
                            </>
                        }
                        <Col xs="4" />
                        {/* <Col xs="4">
                            <Row>
                                {`Opening Balance :  ${this.state.opening_balance}`}
                            </Row>
                            <Row>
                                {`Closing Balance :  ${this.state.closing_balance}`}
                            </Row>
                        </Col> */}
                    </Row>
                </div>
                <div style={this.tableStyles} >
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Date</TableCell>
                                    <TableCell align="left">Type</TableCell>
                                    <TableCell align="left">Particulars</TableCell>
                                    <TableCell align="left">Debit</TableCell>
                                    <TableCell align="left">Credit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.data.map((row, index) => (
                                    <TableRow key={index}>
                                        {console.log(row)}
                                        <TableCell align="left">{row.date_of_transaction}</TableCell>
                                        <TableCell align="left">{row.transaction_type}</TableCell>
                                        <TableCell align="left">{row.particulars}</TableCell>
                                        <TableCell align="left">{row.debit}</TableCell>
                                        <TableCell align="left">{row.credit}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />

                <Row>
                    <Col xs="3" align="center" >
                        Date
                    </Col>
                    <Col xs="3/" />
                    <Col xs="3" />
                    <Col xs="3" align="right" >
                        Signature
                    </Col>
                </Row>

            </div>
        );
    }

    tableStyles = {
        paddingLeft: "50px",
        paddingRight: "50px",
        // minWidth: "650px",
    }
}


export default PrintStatement;