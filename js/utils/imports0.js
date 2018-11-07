function imports(moduleName) {
  if (!window[`${moduleName}`]) throw `No Modules: ${moduleName}`;
  else return window[`${moduleName}`];
}
