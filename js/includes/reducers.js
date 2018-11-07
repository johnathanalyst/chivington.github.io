// function viewState (state = "HOME", action) {
//   const viewChoices = {
//     "CHANGE_VIEW": () => action.view,
//     "NAV_TO": () => action.view,
//     "DEFAULT": () => state
//   }
//   return viewChoices[action.type] ? viewChoices[action.type]() : viewChoices["DEFAULT"]();
// }
//
// function menuState (state = "CLOSED", action) {
//   const menuChoices = {
//     "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
//     "OPEN_MENU": () => "OPEN",
//     "CLOSE_MENU": () => "CLOSED",
//     "DEFAULT": () => state
//   }
//   return menuChoices[action.type] ? menuChoices[action.type]() : menuChoices["DEFAULT"]();
// }
