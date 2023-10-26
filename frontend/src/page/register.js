import { getUser, register } from '../service.js';
import { setState } from '../store.js';
import { navigate } from '../router.js';

export function registerPage (rootNode) {
  rootNode.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    console.log(value);
    if (value.password !== value.confirm) {
      alert('Passwords not match!');
      return;
    }
    register(value)
      .then(res => {
        if (res.error) {
          alert(res.error);
          return Promise.reject();
        } else {
          setState({
            token: res.token,
            userId: res.userId
          });
          return getUser(res.userId);
        }
      })
      .then(res => {
        setState({
          profile: res
        });
        navigate('feed');
      });
  });
}
