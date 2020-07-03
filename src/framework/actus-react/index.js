import React, { useContext } from "react";

const Context = React.createContext();

function Provider(props) {
  return <Context.Provider value={props}>{props.children}</Context.Provider>;
}

function connect(
  mapStateToProps = (state) => ({ state }),
  mapActionsToProps = (actions) => ({ actions })
) {
  return (Component) => (ownProps) => {
    const { state, actions } = useContext(Context);

    const mergedProps = {
      ...ownProps,
      ...mapStateToProps(state),
      ...mapActionsToProps(actions),
    };

    return <Component {...mergedProps} />;
  };
}

export { Provider, connect };
