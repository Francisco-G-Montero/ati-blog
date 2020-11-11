import React from "react";
import BarLoader from "react-spinners/ClipLoader";

class AwesomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    return (
      <BarLoader
        class="loading"
        size={40}
        color={"#123abc"}
        loading={this.state.loading}
      />
    );
  }
}
export default AwesomeComponent;
