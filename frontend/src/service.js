import { getState } from './store.js';
import { BACKEND_PORT } from './config.js';

let base = `http://localhost:${BACKEND_PORT}`;

/**
 * a request method to make ajax requests, using the fetch function
 * @param path
 * @param data
 * @param method
 * @returns {Promise<never>|Promise<T>}
 */
function request (path, data = undefined, method = 'GET') {
  /**
   * check online status
   */
  if (!window.navigator.onLine) {
    window.alert('Operation failed. Please check your network connection!');
    return Promise.reject();
  }

  return fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getState().token
    },
    body: data !== undefined ? JSON.stringify(data) : undefined
  }).then(res => res.json()).catch(err => {
    alert('Server down or there is a network problem, please try again later!');
    return Promise.reject(err);
  });
}

export function register ({ email, password, name }) {
  return request('/auth/register', { email, password, name }, 'POST');
}

export function login ({ email, password }) {
  return request('/auth/login', { email, password }, 'POST');
}

export function jobsFeed (start) {
  return request(`/job/feed?start=${start}`);
}

export function createJob ({ title, image, start, description }) {
  return request('/job', { title, image, start, description }, 'POST');
}

export function updateJob ({ id, title, image, start, description }) {
  return request('/job', { id, title, image, start, description }, 'PUT');
}

export function deleteJob ({ id }) {
  return request('/job', { id }, 'DELETE');
}

export function commentJob ({ id, comment }) {
  return request('/job/comment', { id, comment }, 'POST');
}

export function likeJob ({ id, turnon }) {
  return request('/job/like', { id, turnon }, 'PUT');
}

export function getUser (userId) {
  return request(`/user?userId=${userId}`);
}

export function updateUser ({ email, password, name, image }) {
  return request('/user', { email, password, name, image }, 'PUT');
}

export function watchUser ({ email, turnon }) {
  return request('/user/watch', { email, turnon }, 'PUT');
}
