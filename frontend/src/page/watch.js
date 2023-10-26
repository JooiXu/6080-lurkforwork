import { login, watchUser } from '../service.js';
import { setState } from '../store.js';
import { navigate } from '../router.js';

export function watchPage (rootNode) {
  rootNode.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    watchUser({ ...value, turnon: true }).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        navigate('feed');
      }
    });
  });
}
