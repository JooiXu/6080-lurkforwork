import { createJob, login, updateJob, updateUser } from '../service.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';
import { fileToDataUrl } from '../helpers.js';

export function editProfilePage (rootNode) {

  rootNode.querySelector('.back-btn').addEventListener('click', () => {
    history.back();
  });

  rootNode.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    if (value.password !== value.confirm) {
      alert('Passwords not match!');
      return;
    }
    delete value.confirm;
    if (!value.name) {
      delete value.name;
    }
    if (!value.email) {
      delete value.email;
    }
    if (!value.image.name) {
      delete value.image;
    }
    if (!value.password) {
      delete value.password;
    }
    if (Object.keys(value).length === 0) {
      alert('Please input at least one field!');
      return;
    }

    if (value.image && value.image.name) {
      // has image, convert image first
      try {
        fileToDataUrl(value.image)
          .then(image => {
            updateUser({ ...value, image }).then(res => {
              if (res.error) {
                alert(res.error);
              } else {
                history.back();
              }
            });
          });
      } catch (err) {
        console.log(err);
        alert(err.message);
      }
    } else {
      // no image
      updateUser({ ...value }).then(res => {
        if (res.error) {
          alert(res.error);
        } else {
          history.back();
        }
      });
    }

  });
}
