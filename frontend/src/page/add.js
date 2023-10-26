import { createJob, login } from '../service.js';
import { setState } from '../store.js';
import { navigate } from '../router.js';
import { fileToDataUrl } from '../helpers.js';

export function addPage (rootNode) {
  rootNode.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    value.start = new Date(value.start).toISOString();
    try {
      fileToDataUrl(value.image)
        .then(image => {
          createJob({ ...value, image }).then(res => {
            if (res.error) {
              alert(res.error);
            } else {
              navigate('feed');
            }
          });
        });
    } catch (err) {
      console.log(err);
      alert(err.message);
    }

  });
}

