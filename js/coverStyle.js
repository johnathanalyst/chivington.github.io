// CoverView Styles
const styles = {
  view: `
    position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 0;
    display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
  `,
  wp: `
    position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
  `,
  filter: `
    position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 5; overflow-y: scroll;
    display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5;
    background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
  `,
  cover: `
    display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
    margin: 0.25em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
  `,
  coverHeader: `
    display: flex; flex-direction: row; justify-content: space-between; align-items: center;
    padding: 1.25em 4em; background-color: #004575; color: #eee; border-bottom: 1px solid #000;
  `,
  coverHeaderMobile: `
    display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
    background-color: #004575; color: #eee; border-bottom: 1px solid #000;
  `,
  coverHeaderLeft: `
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    border: 1px solid #0f0;
  `,
  coverHeaderLeftMobile: `
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    border: 1px solid #0f0; height: 35em;
  `,
  coverImg: `
    margin: 0 0 0.25em 0; width: 8em; border: 1px solid #333; border-radius: 100%;
    border: 1px solid #00f;
  `,
  coverName: `
    margin: 0.2em; font-size: 1.25em;
    border: 1px solid #0ff;
  `,
  coverTitle: `
    margin: 0.2em; font-size: 0.75em;
    border: 1px solid #ff0;
  `,
  coverHeaderRight: `
    display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start;
    border: 1px solid #f00;
  `,
  coverHeaderRightMobile: `
    display: flex; flex-direction: column; justify-content: space-between; align-items: center; margin: 0.5em 0 0 0;
    border: 1px solid #f00; height: 25em;
  `,
  coverHeaderRow: `
    display: flex; flex-direction: row; justify-content: center; align-items: center; margin: 0.25em;
    border: 1px solid #ff9; padding: 0.25em;
  `,
  coverHeaderIcon: `
    height: 0.9em; width: 0.9em; margin: 0 0.35em 0 0;
    border: 1px solid #f00;
  `,
  coverHeaderLink: `
    text-decoration: underline; cursor: pointer; font-size: 0.8em;
     border: 1px solid #0f0;
  `,
  coverBody: `
    display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
    padding: 1em 3em; background-color: #fff; color: #222;
    border: 1px solid #000;
  `,
  coverDownloadRow: `
    display: flex; flex-direction: row; justify-content: flex-end; align-items: center;
    border: 1px solid #000;
  `,
  downloadButton: `
    margin: 0.25em; color: #000; font-family: sans-serif; cursor: pointer;
    border: 1px solid #000;
  `,
  coverLine: `
    margin: 0.5em; text-align: center;
    border: 1px solid #000;
  `
}
