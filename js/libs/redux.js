function Redux() {
  return {
    createStore: function(stateReducer, middlewares) {
      var state = {}, listeners = [];

      function getState() {
        return state;
      }

      function dispatch(action) {
        if (middlewares.logActions) middlewares.logActions("before", state, action);
        state = stateReducer(state, action);
        if (middlewares.logActions) middlewares.logActions("after", state, action);
        listeners.forEach(listener => listener.func(...listener.params));
      }

      function subscribe(listener) {
        listeners.push(listener);
        return () => {
          listeners = listeners.filter(l => l !== listener);
        }
      }

      dispatch({type: "@@INIT"});

      return { getState, dispatch, subscribe };
    },
    combineReducers: function(reducers) {
      return (state, action) => {
        return Object.keys(reducers).reduce((combined, k) => {
          combined[k] = reducers[k](state[k], action);
          return combined;
        }, {});
      }
    },
    storeMiddlewares: {
      logActions: function(stage, state, action) {
        if  (action.type != "@@INIT") {
          if (stage == "before") {
            console.log("\n%cCurrent State: ", "font-weight: bold; color: #0b0;", state);
            console.log(`Action Dispatched: %c"${action.type}"`, "color: #e00;");
          }
          if (stage == "after")
            console.log("%cUpdated State: ", "font-weight: bold; color: #0b0;", state);
        }
      }
    }
  }
}
 module.exports = { Redux }
