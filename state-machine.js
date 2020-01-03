function StateMachine(reducer) {
  var state;
  var listeners = [];

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(function(listener) { listener(state); });
  };

  function subscribe(listener) {
    listeners.push(listener);
    return function() {
      listeners = listeners.filter(function(l) { return l !== listener });
    }
  };

  dispatch({});

  return { getState: getState, dispatch: dispatch, subscribe: subscribe };
};
