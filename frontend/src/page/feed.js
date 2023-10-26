import { commentJob, deleteJob, jobsFeed, likeJob } from '../service.js';
import { clearDiv, cloneTemplate, dateStr, sendNotify } from '../helpers.js';
import { getState, resetState, setState } from '../store.js';
import { navigate } from '../router.js';

let pollInterval = 0;
let pageSize = 5;
let notifiedIds = [];

export function stopFeedPolling () {
  clearInterval(pollInterval);
}

/**
 * function to update a feed item node and bind events
 * @param t the node template
 * @param item the feed data
 * @param refresh callback to refresh data
 */
export function updateItem (t, item, refresh) {
  t.querySelector('.job-img').setAttribute('src', item.image);
  t.querySelector('.card-title').textContent = item.title;
  t.querySelector('.card-text').textContent = item.description;
  t.querySelector('.job-meta .user-link').textContent = `${item.creatorId}`;
  t.querySelector('.job-meta .user-link').setAttribute('href', `#profile=${item.creatorId}`);
  t.querySelector('.job-meta2 small').textContent = `Created at ${dateStr(item.createdAt, true)}, starting at ${dateStr(item.start)}`;
  let liked = item.likes.some(v => v.userId === getState().userId);
  let showLikes = t.querySelector('.likes-num');
  let showComments = t.querySelector('.comments-num');
  let toggleLike = t.querySelector('.toggle-like');
  let toggleComment = t.querySelector('.toggle-comment');
  let commentForm = t.querySelector('.comment-form');

  toggleLike.textContent = liked ? 'Unlike' : 'like';
  showLikes.setAttribute('data-bs-target', `#likes-list-${item.id}`);
  showLikes.textContent = `Likes (${item.likes.length})`;
  showComments.setAttribute('data-bs-target', `#comments-list-${item.id}`);
  toggleComment.setAttribute('data-bs-target', `#comment-form-${item.id}`);
  showComments.textContent = `Comments (${item.comments.length})`;

  t.querySelector('.likes-list').id = `likes-list-${item.id}`;
  t.querySelector('.comments-list').id = `comments-list-${item.id}`;

  commentForm.id = `comment-form-${item.id}`;
  let likesList = t.querySelector('.likes-list ul');
  let commentsList = t.querySelector('.comments-list ul');

  clearDiv(likesList);
  clearDiv(commentsList);

  // like list
  for (let like of item.likes) {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.textContent = `${like.userName} [${like.userEmail}]`;
    a.setAttribute('href', `#profile=${like.userId}`);
    li.appendChild(a);
    likesList.appendChild(li);
  }

  // comment list
  for (let comment of item.comments) {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.textContent = `${comment.userName} [${comment.userEmail}]`;
    a.setAttribute('href', `#profile=${comment.userId}`);
    a.classList.add('me-2');
    li.appendChild(a);
    let text = document.createTextNode(`: ${comment.comment}`);
    li.appendChild(text);
    commentsList.appendChild(li);
  }

  // on add btn click
  toggleLike.onclick = () => {
    likeJob({ id: item.id, turnon: !liked }).then(() => refresh());
  };

  // on comment form submit
  t.querySelector('.comment-form form').onsubmit = e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    commentJob({ id: item.id, comment: value.comment })
      .then(() => {
        e.target.querySelector('input').value = '';
        alert('Comment added!');
        refresh();
      });
  };

  let updateBtn = t.querySelector('.update-job');
  let deleteBtn = t.querySelector('.delete-job');
  let isMyJob = item.creatorId === getState().userId;
  if (isMyJob) {
    updateBtn.classList.remove('d-none');
    deleteBtn.classList.remove('d-none');
    updateBtn.onclick = function () {
      navigate(`edit=${item.id}`);
    };
    deleteBtn.onclick = function () {
      if (confirm('Are you sure to delete this job?')) {
        deleteJob({ id: item.id })
          .then(() => refresh());
      }
    };

  }
}

export function feedPage (rootNode) {
  let currentMax = 5;
  let list = rootNode.querySelector('.feeds');
  let loading = false;

  rootNode.querySelector('.logout-btn').addEventListener('click', () => {
    resetState();
    navigate('login');
  });
  let profile = getState().profile;
  rootNode.querySelector('.welcome').textContent = `Welcome, ${profile.name} [${profile.email}].`;
  rootNode.querySelector('.my-profile').setAttribute('href', `#profile=${getState().userId}`);

  function renderJobs (res) {
    for (let item of res) {
      let id = `feed_item_${item.id}`;
      let t = document.getElementById(id);
      if (!t) {
        t = cloneTemplate('feed_item');
        t.querySelector('.card').id = id;
        updateItem(t, item, fetchJobs);
        list.appendChild(t);
      } else {
        t.classList.remove('temp');
        updateItem(t, item, fetchJobs);
      }
    }
  }

  function fetchJobs (start = 0) {
    loading = true;
    if (start === 0) {
      // mark all as temp first
      list.querySelectorAll('.feed-card').forEach(e => e.classList.add('temp'));
    }
    jobsFeed(start)
      .then(res => {
        setState({
          jobs: start === 0 ? res : [...getState().jobs, ...res]
        });
        let newJob = res.find(v => !notifiedIds.includes(v.id) && Date.now() - (new Date(v.createdAt)).getTime() < 1000 * 60);
        if (newJob) {
          // there is a new job just posted within one minute
          notifiedIds.push(newJob.id);
          sendNotify(`A new job [${newJob.title}] just posted, check your feed!`);
        }
        renderJobs(res);
        if (res.length === pageSize && getState().jobs.length < currentMax) {
          // fetch next page
          fetchJobs(start + pageSize);
        } else {
          // remove temp items as they are not existed anymore
          loading = false;
          list.querySelectorAll('.feed-card.temp').forEach(e => e.remove());
        }
      });
  }

  renderJobs(getState().jobs);
  fetchJobs();

  /**
   * pull feeds on every 1 second
   * @type {NodeJS.Timer}
   */
  pollInterval = setInterval(() => {
    if (loading) return;
    fetchJobs();
  }, 1000);

  /**
   * on scroll to bottom fetch next page
   */
  window.onscroll = function () {
    if (!pollInterval) {
      return;
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      currentMax += pageSize;
    }
  };
}