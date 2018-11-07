// import libs
React = require("./libs/React.js");
ReactDOM = require("./libs/ReactDOM.js");
Redux = require("./libs/Redux.js");

console.log("React: ", React);

// // import app
// Shell = require("./Shell.js");
//
// // import reducers
// viewState = require("viewState.js");
// menuState = require("menuState.js");
//
//
// // combine reducers and create store
// const InitState = Redux.combineReducers({viewState, menuState});
// const ReduxStore = Redux.createStore(InitState, Redux.storeMiddlewares);
//
// // initial render
// ReactDOM.render({
//   elem: App,
//   props: {store: ReduxStore},
//   dispatch: ReduxStore.dispatch,
//   children: [null]
// }, document.getElementById("AppRoot"));
//
// // subscribe render method
// ReduxStore.subscribe({
//   func: ReactDOM.render,
//   params: [{
//     elem: App,
//     props: {store: ReduxStore},
//     dispatch: ReduxStore.dispatch,
//     children: [null]
//   },
//   document.getElementById("AppRoot")
// ]});
