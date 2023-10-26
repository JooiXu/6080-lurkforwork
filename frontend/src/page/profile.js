import { getUser, watchUser } from '../service.js';
import { clearDiv, cloneTemplate } from '../helpers.js';
import { updateItem } from './feed.js';
import { getState } from '../store.js';
import { navigate } from '../router.js';

export function profilePage (rootNode, id) {
  let nameEl = rootNode.querySelector('.user-name');
  let emailEl = rootNode.querySelector('.user-email');
  let jobsEl = rootNode.querySelector('.jobs');
  let watchsEl = rootNode.querySelector('.watchlist');
  let noJobsEl = rootNode.querySelector('.no-jobs');
  let noWatchEl = rootNode.querySelector('.no-watch');
  let watchBtn = rootNode.querySelector('.watch-btn');
  let unwatchBtn = rootNode.querySelector('.unwatch-btn');
  let editBtn = rootNode.querySelector('.edit-btn');
  let email = '';
  let avatar = rootNode.querySelector('.avatar');

  rootNode.querySelector('.back-btn').addEventListener('click', () => {
    history.back();
  });

  watchBtn.addEventListener('click', () => {
    watchUser({ email, turnon: true }).then(() => fetchData());
  });
  unwatchBtn.addEventListener('click', () => {
    watchUser({ email, turnon: false }).then(() => fetchData());
  });

  if (id === getState().userId.toString()) {
    editBtn.classList.remove('d-none');
    editBtn.addEventListener('click', () => {
      navigate('edit-profile');
    });
  }

  function fetchData () {
    getUser(id)
      .then(res => {
        console.log(res);
        email = res.email;
        nameEl.textContent = `${res.name}'s`;
        emailEl.textContent = `[${res.email}]`;
        avatar.setAttribute('src', res.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==');
        clearDiv(jobsEl);
        clearDiv(watchsEl);
        if (res.jobs.length === 0) {
          noJobsEl.classList.remove('d-none');
        } else {
          noJobsEl.classList.add('d-none');
        }

        if (res.watcheeUserIds.length === 0) {
          noWatchEl.classList.remove('d-none');
        } else {
          noWatchEl.classList.add('d-none');
        }

        for (let item of res.jobs) {
          let id = `feed_item_${item.id}`;
          let t = cloneTemplate('feed_item');
          t.querySelector('.card').id = id;
          updateItem(t, item, fetchData);
          t.querySelector('.likes-num').classList.add('d-none');
          t.querySelector('.comments-num').classList.add('d-none');
          t.querySelector('.toggle-like').classList.add('d-none');
          t.querySelector('.toggle-comment').classList.add('d-none');
          jobsEl.appendChild(t);
        }

        for (let item of res.watcheeUserIds) {
          let li = document.createElement('li');
          let a = document.createElement('a');
          a.setAttribute('href', `#profile=${item}`);
          a.textContent = item;
          li.appendChild(a);
          watchsEl.appendChild(li);
        }

        let hasWatched = res.watcheeUserIds.includes(getState().userId);
        if (hasWatched) {
          unwatchBtn.classList.remove('d-none');
          watchBtn.classList.add('d-none');
        } else {
          unwatchBtn.classList.add('d-none');
          watchBtn.classList.remove('d-none');
        }
      });
  }

  fetchData();

}