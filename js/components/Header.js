// function Header(props, dispatch) {
//   const styles = {
//     header: `
//       position: absolute; top: 0; left: 0; right: 0;
//       display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
//       height: 2.75em; padding: 0 0 0 0.5em; border-bottom: 1px solid #000; background-color: #eee;
//     `,
//     icon: `height: 2em; width: 2em;`,
//     title: `margin-left: 0.25em; color: #222; font-size: 1.5em;`
//   }
//
//   const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "chivingtoninc Icon"}, [null]);
//   icon.addEventListener("click", function(e) {
//     dispatch({type: "TOGGLE_MENU"})
//   });
//
//   const title = React.createElement("h1", {style: styles.title}, ["chivingtoninc"]);
//   title.addEventListener("click", function() {
//     dispatch({type: "CLOSE_MENU"});
//     dispatch({type: "NAV_TO", view: "HOME"})
//   });
//
//   return React.createElement("div", {style: styles.header}, [icon, title]);
// }
