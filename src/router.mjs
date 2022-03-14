export const redirect = (path) => {
  const { pathname } = window.location;

  if (path === pathname) return;

  const locationChangeEvent = new CustomEvent('locationchange', {
    detail: { href: path }
  });

  window.dispatchEvent(locationChangeEvent);
};

export const browserRoute = (callback) => {
  const handleLocationChange = (e) => {
    const { href } = e.detail;

    window.history.pushState(null, '', href);
    callback();
  };

  window.addEventListener('locationchange', handleLocationChange);
  window.addEventListener('popstate', callback);
};

/**
 * @param {(string|string[])} path - Pathname to set the route.
 * @param {function} component - Function or Class to create an instance.
 * @param {HTMLElement} target - HTMLElement to which the component is mounted.
 * @param {object} state - State to be updated on the component.
 */
export const route = ({ path: targetPath, component, target, state = {} }) => {
  const { pathname: currentPath } = window.location;

  if (Array.isArray(targetPath)) {
    targetPath.forEach((oneTargetPath) => {
      matchComponentWithCurrentPath(
        oneTargetPath,
        component,
        target,
        state,
        currentPath
      );
    });
  } else {
    matchComponentWithCurrentPath(
      targetPath,
      component,
      target,
      state,
      currentPath
    );
  }
};

const matchComponentWithCurrentPath = (
  targetPath,
  component,
  target,
  state,
  currentPath
) => {
  const isRouteRequired = checkIsPathMatched(targetPath, currentPath);
  if (!isRouteRequired) return;

  const paramName = getParameter(targetPath);
  const paramValue = getParameter(currentPath);

  if (paramName) {
    createComponentWithParam(target, state, component, paramName, paramValue);
  } else {
    createComponentWithoutParam(target, state, component);
  }
};

const checkIsPathMatched = (targetPath, currentPath) => {
  const isTargetPathWithParam = /(\/:\w+)$/.test(targetPath);
  if (!isTargetPathWithParam) return targetPath === currentPath;
  const targetPathWithoutParam = targetPath.replace(/(\/:\w+)$/, '');
  const currentPathWithoutParam = currentPath.replace(/(\/\w+)$/, '');
  return targetPathWithoutParam === currentPathWithoutParam;
};

const getParameter = (path) => {
  const regexGettingParam = /\w+$/i;
  return regexGettingParam.exec(path) && regexGettingParam.exec(path)[0];
};

const createComponentWithParam = (
  target,
  state,
  component,
  paramName,
  paramValue
) => {
  new component(target, { ...state, params: { [paramName]: paramValue } });
};

const createComponentWithoutParam = (target, state, component) => {
  new component(target, state);
};
