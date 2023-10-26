/**
 * a basic store module, can keep data in localstorage for offline usage
 */
 let stateObj = {
  token: null,
  userId: null,
  profile: null,
  jobs: [],
};

let state = JSON.parse(JSON.stringify(stateObj));

if (localStorage.getItem('state')) {
  state = JSON.parse(localStorage.getItem('state'));
}

export function getState () {
  return state;
}

export function setState (s) {
  state = {
    ...state,
    ...s,
  };
  try {
    localStorage.setItem('state', JSON.stringify(state));
  } catch (err) {
    console.error(err);
  }
}

export function resetState () {
  setState(JSON.parse(JSON.stringify(stateObj)));
}
