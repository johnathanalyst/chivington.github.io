/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: Personal Web App                                                         *
 * Description: Single page web app, modeled after Redux/React.                      *
 * Version: 0.3.0 - full React-style vDOM diffing engine.                            *
 * --------------------------------------------------------------------------------- */

/* ----------------------------------- Libraries ----------------------------------- *
 *           Barebones modules for initializing/maintaining app state & UI.          *
 * --------------------------------------------------------------------------------- */
(function React() {
  console.log('Initializing React...');

  function createVDOM(rootNode) {
    let vdom = {};

    function getVDOM() {
      return vdom;
    };

    function diff(action) {
      nextVDOM = rootNode(vdom, action);
    };

    return { getVDOM, diff };
  }

  const React = {
    // create DOM element
    createElement: function(type, attrs, children) {
      const ReactElement = document.createElement(type);
      if (!!Object.keys(attrs).length) Object.keys(attrs).forEach(k => ReactElement.setAttribute(k, attrs[k]));
      return ReactElement;
    },
    // create component and insert into VDOM
    createComponent: function(props) {
      //
    }
  };

  window.React = React;
})();


(function Redux() {

  function createStore(rootReducer, middlewares) {
    let state = {}, listeners = [];
    const { logActions, listenerBypass } = middlewares;

    function getState() {
      return state;
    }

    function dispatch(action) {
      if (logActions) logActions('before', state, action);
      state = rootReducer(state, action);
      if (logActions) logActions('after', state, action);

      if (listenerBypass && listenerBypass(action.type)[0])
        listeners.forEach(listener => listenerBypass(action.type).forEach(bypassName => {
          if (bypassName != listener.name) listener.function(...listener.params);
        }));
      else listeners.forEach(listener => listener.function(...listener.params));
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

  const middlewares = {
    logActions: function() {
      return function(stage, state, action) {
        if  (action.type != '@@INIT') {
          if (stage == 'before') {
            console.log('\n%cCurrent State: ', 'font-weight: bold; color: #0b0;', state);
            console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;');
          }
          if (stage == 'after')
            console.log('%cUpdated State: ', 'font-weight: bold; color: #0b0;', state);
        }
      }
    },
    listenerBypass: function(bypassMap = {}) {
      return function(actionType) {
        return bypassMap[actionType] || [];
      }
    }
  };

  window.Redux = { createStore, createReducer, combineReducers, middlewares };
})();

console.log(React);
console.log(Redux);
