/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: uRedux                                                                   *
 * Description: Micro app-state machine, based loosely on Redux.                     *
 * --------------------------------------------------------------------------------- */

(function uRedux() {

  function logActions(prevState, newState, action) {
    if (action.type != '@@INIT') {
      console.log('\n%cPrevious State: ', 'font-weight: bold; color: #0b0;', state);
      console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;');
      console.log('%cUpdated State: ', 'font-weight: bold; color: #0b0;', state);
    }
  };

  function createStore(rootReducer, middlewares = []) {
    let state = {}, listeners = [];

    function getState() {
      return state;
    }

    function dispatch(action) {
      const newState = rootReducer(state, action);
      if (!!middlewares.includes('log-actions')) logActions(state, newState, action);
      listeners.forEach(listener => listener(state));
      state = newState;
    }

    function subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    }

    dispatch({type: '@@INIT'});
    return { getState, dispatch, subscribe };
  };

  function createReducer(initialState, map = {}) {
    return function(state = initialState, action) {
      return map[action.type] ? map[action.type](action) : state;
    }
  };

  function combineReducers(reducers) {
    return function(state, action) {
      return Object.keys(reducers).reduce((combined, k) => {
        combined[k] = reducers[k](state[k], action);
        return combined;
      }, {});
    }
  };

  window.uRedux = { createStore, createReducer, combineReducers };
})();
