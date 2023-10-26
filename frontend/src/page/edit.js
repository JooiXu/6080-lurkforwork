import { createJob, login, updateJob } from '../service.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';
import { fileToDataUrl } from '../helpers.js';

export function editPage (rootNode, id) {
  let data = getState().jobs.find(v => v.id === id);
  rootNode.querySelector('[name=title]').value = data.title;
  rootNode.querySelector('[name=description]').value = data.description;

  let start = new Date(data.start);
  start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
  rootNode.querySelector('[name=start]').value = start.toISOString().slice(0, 16);
  rootNode.querySelector('.back-btn').addEventListener('click', () => {
    history.back();
  });

  rootNode.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    value.start = new Date(value.start).toISOString();
    if (value.image.name) {
      // has image, convert image first
      try {
        fileToDataUrl(value.image)
          .then(image => {
            updateJob({ ...value, image, id }).then(res => {
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
      // no image, use the original one
      updateJob({ ...value, image: data.image, id }).then(res => {
        if (res.error) {
          alert(res.error);
        } else {
          history.back();
        }
      });
    }

  });
}
