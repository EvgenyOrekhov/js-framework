import BoredApp from "./BoredApp";
import { connect } from "./framework/actus-react";

function mapStateToProps(state) {
  return { state };
}

function mapActionsToProps(actions) {
  return { actions };
}

export default connect(mapStateToProps, mapActionsToProps)(BoredApp);
