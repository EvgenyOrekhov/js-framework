import React, { useContext } from "react";

let ActusContext = React.createContext();

function Provider(props) {
  return (
    <ActusContext.Provider value={props}>
      {props.children}
    </ActusContext.Provider>
  );
}

function connect(mapStateToProps, mapActionsToProps) {
  return (Component) => (ownProps) => {
    const { state, actions } = useContext(ActusContext);

    const mergedProps = {
      ...ownProps,
      ...mapStateToProps(state),
      ...mapActionsToProps(actions),
    };

    return <Component {...mergedProps} />;
  };
}

export { Provider, connect };
