// import libs
React = imports("React")();
ReactDOM = imports("ReactDOM")();
Redux = imports("Redux")();

// import app
App = imports("App");

// import reducers
viewState = imports("viewState");
menuState = imports("menuState");


// combine reducers and create store
const InitState = Redux.combineReducers({viewState, menuState});
const ReduxStore = Redux.createStore(InitState, Redux.storeMiddlewares);

// initial render
ReactDOM.render({
  elem: App,
  props: {store: ReduxStore},
  dispatch: ReduxStore.dispatch,
  children: [null]
}, document.getElementById("AppRoot"));

// subscribe render method
ReduxStore.subscribe({
  func: ReactDOM.render,
  params: [{
    elem: App,
    props: {store: ReduxStore},
    dispatch: ReduxStore.dispatch,
    children: [null]
  },
  document.getElementById("AppRoot")
]});
