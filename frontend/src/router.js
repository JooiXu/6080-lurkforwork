import { getState } from './store.js';
import { loginPage } from './pages/login.js';
import { registerPage } from './pages/register.js';
import { feedPage, stopFeedPolling } from './pages/feed.js';
import { cloneTemplate, clearDiv } from './helpers.js';
import { addPage } from './pages/add.js';
import { watchPage } from './pages/watch.js';
import { editPage } from './pages/edit.js';
import { profilePage } from './pages/profile.js';
import { editProfilePage } from './pages/edit_profile.js';

function getPage (page) {
  return cloneTemplate(`${page}_template`);
}

/**
 * a simple SPA router
 */
function onRouteChange () {
  stopFeedPolling();
  const hash = window.location.hash;
  console.log(hash);
  const token = getState().token;
  let template;
  let main = document.getElementById('main');
  if (hash.startsWith('#login')) {
    template = getPage('login');
    loginPage(template);
  } else if (hash.startsWith('#register')) {
    template = getPage('register');
    registerPage(template);
  } else if (hash.startsWith('#add') && token) {
    template = getPage('add');
    addPage(template);
  } else if (hash.startsWith('#watch') && token) {
    template = getPage('watch');
    watchPage(template);
  } else if (hash.startsWith('#profile') && token) {
    template = getPage('profile');
    let uid = hash.split('=')[1];
    profilePage(template, uid);
  } else if (hash.startsWith('#edit-profile') && token) {
    template = getPage('edit_profile');
    editProfilePage(template);
  } else if (hash.startsWith('#edit') && token) {
    template = getPage('edit');
    let id = hash.split('=')[1];
    editPage(template, id);
  } else if (hash.startsWith('#feed') && token) {
    template = getPage('feed');
    feedPage(template);
  } else {
    navigate('login');
  }
  clearDiv(main);
  main.appendChild(template);
}

export function navigate (page) {
  window.location.hash = `#${page}`;
}

/**
 * listening on window on hashchange event, and render pages base on new hash
 */
window.addEventListener('hashchange', onRouteChange);
onRouteChange();