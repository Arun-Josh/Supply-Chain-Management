import React from "react";
import {
  Button
} from "reactstrap";
import { Redirect } from "react-router-dom";

class Header extends React.Component {

  state = {
    isButtonClicked: false,
  }

  // handleButtonTextChange = ( text ) =>{
  //   this.setState({buttonText: text})
  // }

  handleButtonClick = () => {
    console.log("bc")
    console.log(this.props.redirectURL)
    this.setState({ isButtonClicked: true })
  }

  render() {
    return (
      <>
        <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
          {
            this.props.buttonText ?
              <div className="ml-4 ">
                <Button
                  color="default"
                  size="lg"
                  onClick={this.handleButtonClick}
                >
                  <span className="btn-inner--icon">
                    <i className="ni ni-bold-right" />
                  </span>
                  <span className="btn-inner--text"> {this.props.buttonText} </span>
                </Button>
              </div>
              : 
              ""
            }
        </div>
        {this.state.isButtonClicked ? <Redirect to={this.props.redirectURL} /> : ""}
      </>
    );
  }
}

export default Header;
