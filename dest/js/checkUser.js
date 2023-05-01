import { QUERY_LINK } from "./backlink.js";
const link = QUERY_LINK + 'users';
let userID;
let page = window.location.href.split('/');
page = page[page.length - 2];
window.onload = function () {
  let userField = document.getElementById('login');
  if (page === 'user' && localStorage.getItem('user_token') === null && sessionStorage.getItem('user_token') === null) {
    location = "/login/";
  }
  const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
  if (userToken !== 0) {
    main(userToken, userField);
  }
  else {
    userField.innerHTML = 'Увійти';
  }
}

async function getUser(token) {
  let newlink = link + '?token=' + token;
  let response = await fetch(newlink);
  return await response.json();
}
async function outUser(data, user) {
  userID = data['id'];
  let name = data['login'];
  user.innerHTML = name;
  user.setAttribute('href', '/user');
  if (page === 'user') {
    let userName = document.getElementById('name');
    let email = document.getElementById('email');
    let created = document.getElementById('created-at');
    userName.innerHTML = name;
    email.innerHTML = data['email'];
    created.innerHTML = "Акаунт створено: " + data['created_at'];
  }
}

async function main(token, userField) {
  let user = await getUser(token);
  if (user.error === undefined) {
    await outUser(user, userField);
    return;
  }
  localStorage.clear();
  sessionStorage.clear();
  userField.innerHTML = 'Увійти';
}
