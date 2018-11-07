function Menu(props, dispatch) {
  const styles = {
    menuOpen: `
      position: absolute; top: 2.8em; left: 0; bottom: 0; width: 7em; padding: 0.25em 1em 0 0;
      display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
      background-color: rgba(20, 20, 60, 1); border-right: 1px solid #000; animation: menuOpen 0.25s 1;
    `,
    menuClosed: `
      display: none;
    `,
    link: `
      padding: 0.5em; border-bottom: 0.25px solid #222; color: #fff;
    `
  }

  const menuStyle = (props.menuState == "OPEN") ? styles.menuOpen : styles.menuClosed;


  const home = React.createElement("a", {style: styles.link}, ["Home"]);
  home.addEventListener("click", function(){
    dispatch({type: "CLOSE_MENU"});
    dispatch({type: "NAV_TO", view: "HOME"});
  });

  const about = React.createElement("a", {style: styles.link}, ["Me"]);
  about.addEventListener("click", function() {
    dispatch({type: "CLOSE_MENU"});
    dispatch({type: "NAV_TO", view: "ABOUT"});
  });

  const projects = React.createElement("a", {style: styles.link}, ["Projects"]);
  projects.addEventListener("click", function () {
    dispatch({type: "CLOSE_MENU"});
    dispatch({type: "NAV_TO", view: "PROJECTS"});
  });


  return React.createElement("div", {style: menuStyle}, [home, about, projects]);
}
