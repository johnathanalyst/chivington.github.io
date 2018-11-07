function Sales() {
  Styles = {
    Well: `
      display: flex; flex-direction: row; justify-content: center; align-items: center;
      margin: 3em auto; padding: 2em 3em; border: 1px solid #047; border-radius: 7px; background-color: #ccc;
    `
  }

  const Greeting = React.createElement("h1", [null], ["Sales"]);
  const Well = React.createElement("div", [["style", Styles.Well]], [Greeting]);

  return React.createElement("div", [null], [Well]);
}
