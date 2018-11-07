// function Procedure(props, dispatch) {
//   const styles = {
//     menuOpen: `
//       position: absolute; top: 2.75em; left: 0; bottom: 0; width: 7em;
//       display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
//       background-color: #069; border-right: 1px solid #000;
//     `,
//     menuClosed: `display: none;`,
//     link: `
//       padding: 0.5em; border-bottom: 1px solid #000; color: #fff;
//     `
//   }
//
//   const home = React.createElement("div", {style: styles.link}, ["Home"]);
//   const sales = React.createElement("div", {style: styles.link}, ["Sales"]);
//
//   const menuStyle = (props.menuState == "OPEN") ? styles.menuOpen : styles.menuClosed;
//
//   return React.createElement("div", {style: menuStyle}, [home, sales]);
// }
