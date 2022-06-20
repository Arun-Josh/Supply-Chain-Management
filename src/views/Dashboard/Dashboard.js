/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Bar } from "react-chartjs-2";
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col
} from "reactstrap";

// core components
import {
    chartOptions,
    parseOptions,
} from "variables/charts.js";

import Select from "react-select";
import CONSTANTS from "../../variables/general.js"
import Axios from "axios";
import { withSnackbar } from "notistack";

class Dashboard extends React.Component {

    state = {
        commodities: [],
        options: {
            commodities: []
        },
        charts: {
            commodityChart: {
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Commodities',
                            backgroundColor: 'rgba(176,42,176,0.25)',
                            borderColor: 'rgba(176,42,176,1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(176,42,176,0.4)',
                            hoverBorderColor: 'rgba(176,42,176,1)',
                            data: []
                        }
                    ]
                }
            }
        }

    }

    componentDidMount() {
        Axios.get(`${CONSTANTS.SERVER_URL}/api/commodities/`)
            .then(res => {
                console.log(res)
                let commodities = [...res.data];
                this.setState({ commodities: commodities }, () => { this.constructChartForCommodityGroup(res.data[0]._id) })
                let options = this.state.options;
                res.data.map(commodity => {
                    let c = {}
                    c.value = commodity._id;
                    c.label = commodity.commodity_group_name;
                    options.commodities.push(c)
                    return null;
                })
                this.setState({ options })
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

    componentWillMount() {
        if (window.Chart) {
            parseOptions(Chart, chartOptions());
        }
    }

    handleCommoditySelectChange = (props, meta) => {
        const value = props.value;
        this.setState()
        this.constructChartForCommodityGroup(value)
    }

    constructChartForCommodityGroup = (commodity_group_id) => {
        Axios.get(`${CONSTANTS.SERVER_URL}/api/admins/stock/${commodity_group_id}`)
            .then(res => {
                let maxQuantity = 0;
                let subCommoditiesQuantity = [];
                let subCommoditiesLabel = [];

                res.data.map((subCommodity) => {
                    subCommoditiesQuantity.push(subCommodity.Stock);
                    subCommoditiesLabel.push(subCommodity._id);
                    if (subCommodity.Stock > maxQuantity) {
                        maxQuantity = subCommodity.Stock
                    }
                    return null;
                })

                if (maxQuantity !== 0){
                    subCommoditiesQuantity.push(Math.ceil(maxQuantity * 1.2) < 10 ? 10 : Math.ceil(maxQuantity * 1.2))
                }

                let charts = this.state.charts
                charts.commodityChart.data.datasets[0].data = subCommoditiesQuantity;
                charts.commodityChart.data.labels = subCommoditiesLabel;

                this.setState({ charts: charts });
            })
            .catch(err => console.log(err))
    }

    render() {
        return (
            <>
                {/* Page content */}
                <Container className="mt--7" fluid>
                    <Row>
                        <Col xl="12">
                            <Card className="shadow">
                                <CardHeader className="bg-transparent">
                                    <Row className="align-items-center">
                                        <div className="col">
                                            <h6 className="text-uppercase text-muted ls-1 mb-1">
                                                Stock
                                            </h6>
                                            <h2 className="mb-0">Total Stock</h2>
                                        </div>
                                        <Col className="text-right">
                                            <Select
                                                placeholder={this.state.options.commodities[0] !== undefined ? this.state.options.commodities[0].label : "" }
                                                // value={
                                                //     this.state.options.commodities[0]
                                                // }
                                                options={this.state.options.commodities}
                                                onChange={this.handleCommoditySelectChange}
                                            />
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    {/* Chart */}
                                    <div className="chart">
                                        <Bar
                                            data={this.state.charts.commodityChart.data}
                                            // options={this.state.charts.commodityChart.options}
                                            className="chart-canvas"
                                            id="chart-bars"
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default withSnackbar(Dashboard);
