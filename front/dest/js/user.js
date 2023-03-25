



const link = 'http://artist-blog.ua/backend/users';
let userID;
let page = window.location.href.split('/');
page = page[page.length - 2];
window.onload = function () {
  if (page === 'user' && localStorage.getItem('user_token') === null && sessionStorage.getItem('user_token') === null) {
    location = "/front/login/";
  }
  let userField = document.getElementById('login');
  const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
  if (userToken !== 0) {
    getUser(link, userToken, userField);
  }
  else {
    userField.innerHTML = 'Увійти';
  }
}

async function getUser(link, token, userfield) {
  let newlink = link + '?token=' + token;
  await fetch(newlink)
    .then(res => res.json())
    .then(user => outUser(user, userfield))
    .catch(exeption => console.log(exeption));
}
async function outUser(data, user) {
  userID = data['id'];
  let name = data['login'];
  user.innerHTML = name;
  user.setAttribute('href', '/front/user');
  if (page === 'user') {
    let userName = document.getElementById('name');
    let email = document.getElementById('email');
    let created = document.getElementById('created-at');
    userName.innerHTML = "Ім'я: " + name;
    email.innerHTML = "Email: " + data['email'];
    created.innerHTML = "Акаунт створено: " + data['created_at'];
  }

}

const logoutButton = document.querySelector('.logout-button') || null;
if (logoutButton !== null) {
  logoutButton.addEventListener('click', e => {
    e.preventDefault()
    localStorage.clear();
    sessionStorage.clear();
    location = "/front/login/";
  });

}
