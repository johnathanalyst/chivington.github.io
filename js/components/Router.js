// import views
Home = imports("Home");


// define Router component
function Router(props, dispatch, children) {
  const styles = {
    router: `
      position: absolute; top: 2.75em; left: 0; bottom: 0; right: 0;
      display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
      border: 5px solid #000; background-color: #069;
    `
  }

  return React.createElement("div", {style: styles.router}, [Home(null, dispatch, null)]);
}
