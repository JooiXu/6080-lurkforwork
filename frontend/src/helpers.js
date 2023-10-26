/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
 export function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

export function cloneTemplate (id) {
  let t = document.querySelector(`#${id}`);
  return document.importNode(t.content, true);
}

export function pad (str) {
  let s = str.toString();
  return s.length < 2 ? '0' + s : s;
}

export function dateStr (str, ago = false) {
  let date = new Date(str);
  let hours = (date.getTime() - Date.now()) / 1000 / 60 / 60;
  if (hours > -24 && hours < 0 && ago) {
    hours = Math.abs(hours);
    let h = Math.floor(hours);
    let m = Math.floor((hours - h) * 60);
    return `${h} hour and ${m} minute ago`;
  } else {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}

export function clearDiv (div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

export function sendNotify(msg) {
  Notification.requestPermission().then(function (permission) {
    if (permission !== 'denied') {
      new Notification(msg);
    }
  });
}