
const link = 'http://artist-blog.ua/backend/users';
localStorage.clear();
sessionStorage.clear();
let errors = [];

let loginForm = document.querySelector('.auth__form') ? document.querySelector('.login__form') : false;
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errors = [];
    let user = validateUser();
  });
}


let regForm = document.querySelector('.registration__form') ? document.querySelector('.registration__form') : false;

if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errors = [];
    let user = createUser();
  });
}

function createUser() {
  let userName = document.getElementById('name-field').value;
  let userPassword = document.getElementById('password-field').value;
  let userPasswordVerify = document.getElementById('password-verify-field').value;
  let userEmail = document.getElementById('email-field').value;
  if (userPassword !== userPasswordVerify) {
    errors.push('Паролі не співпадають');
    return outErrors(errors);
  }
  const validationRegExp = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);
  if (!validationRegExp.test(userEmail)) {
    console.log('312312');
    errors.push('Email введено некоректно');
    return outErrors(errors);
  }
  if (errors.length === 0) {

    let items = {
      'name': userName,
      'password': userPassword,
      'email': userEmail,
      'action': 'create',
    }
    fetchHandler(link, items);
  }

}

function validateUser() {
  let userName = document.getElementById('name-field').value;
  let userPassword = document.getElementById('password-field').value;
  let items = {
    'name': userName,
    'password': userPassword,
    'action': 'auth',
  }
  fetchHandler(link, items);
}

async function fetchHandler(link, item) {
  await fetch(link, {
    method: 'POST',
    headers: {
      "Content-type": "application/json;",
    },
    body: JSON.stringify(item),
  })
    .then((res) => res.json())
    .then((user) => login(user))
    .catch((error) => console.log(error));
}

function login(user) {
  if (user.hasOwnProperty('error')) {
    errors.push(user['error']);
    outErrors(errors);
    return 0;
  }
  saveUser(user);
}

function saveUser(user) {
  let rememberStatus = document.getElementById('remember').checked;
  if (rememberStatus) {
    localStorage.setItem('user_token', user['user_token']);
    return;
  }
  sessionStorage.setItem('user_token', user['user_token']);
  window.location.href = '/front/';
}

function outErrors(errors) {
  let errorsList = document.querySelector('.error__list');
  errorsList.innerHTML = '';
  errors.forEach(error => {
    errorsList.innerHTML += '<li class="error__item">' + error + '</li>';
  });
}

