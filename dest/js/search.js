import { QUERY_LINK } from "./backlink.js";

const searchSubmit = document.querySelector('.search__submit-button');
const searchInput = document.querySelector('.search__input');
const searchLink = QUERY_LINK + 'search';
const queryString = window.location.search;
const errorField = document.querySelector('.error-field');
const params = new URLSearchParams(queryString);
const searchParam = params.get('q');
if (searchParam !== null) {
  run();
}

async function run() {
  await getResponse(searchParam);
}

searchSubmit.addEventListener('click', async e => {
  e.preventDefault();

  if (searchInput.value.length === 0) {
    return outError('Будь-ласка введіть дані для пошуку', errorField);
  } else {
    await getResponse(searchInput.value);
  }

});
async function getResponse(value) {
  let newLink = searchLink + '?value=' + value;
  let response = await fetch(newLink, {
    method: 'GET',
  });
  response = await response.json();
  if (response.result) {
    outElements(response);
    errorField.innerHTML = '';
  }
  else {
    return outError('Записів не знайдено', errorField);
  }
}

function outElements(items) {
  const users = items.users;
  const works = items.works;
  const usersTitle = document.querySelector('.user-title');
  const worksTitle = document.querySelector('.work-title');

  if (Object.keys(users).length > 0) {
    usersTitle.innerHTML = 'Користувачі';
    outUsers(users);

  }
  else {
    usersTitle.innerHTML = 'Користувачів не знайдено';
  }
  if (Object.keys(works).length > 0) {
    outWorks(works);
    worksTitle.innerHTML = 'Роботи';
  } else {
    worksTitle.innerHTML = 'Робіт не знайдено';
  }
}

function outUsers(users) {
  const userImageLink = QUERY_LINK + 'UserImages/';
  const usersItems = document.querySelector('.users__items');
  usersItems.innerHTML = '';
  for (const key in users) {
    const element = users[key];
    let userItem = document.createElement('div');
    userItem.classList.add('user__item');
    let userImage = document.createElement('div');
    userImage.classList.add('user__img');
    let image = document.createElement('img');
    userImage.appendChild(image);
    let userValues = document.createElement('a');
    userValues.classList.add('user__values');
    let userName = document.createElement('span');
    userName.classList.add('user__name');
    let userEmail = document.createElement('span');
    userEmail.classList.add('user__email');
    userValues.appendChild(userName);
    userValues.appendChild(userEmail);


    userItem.id = 'user-' + element.id;
    if (element.user_image !== 'empty') {
      image.src = userImageLink + element.user_image;
    } else {
      image.src = '../dest/images/default-background.webp';
    }

    userValues.href = '../';
    userName.textContent = "Ім'я: " + element.login;
    userEmail.textContent = "Email: " + element.email;
    userItem.appendChild(userImage);
    userItem.appendChild(userValues);
    usersItems.appendChild(userItem);
  }
}
function outWorks(works) {
  const workImageLink = QUERY_LINK + 'portfolio/logo/';
  const worksItems = document.querySelector('.works__items');
  worksItems.innerHTML = '';
  for (const key in works) {
    const element = works[key];
    let workItem = document.createElement('div');
    workItem.classList.add('work__item');
    let workImage = document.createElement('div');
    workImage.classList.add('work__img');
    let image = document.createElement('img');
    workImage.appendChild(image);
    let workValues = document.createElement('a');
    workValues.classList.add('user__values');
    let workName = document.createElement('span');
    workName.classList.add('user__name');
    let workDesc = document.createElement('span');
    workDesc.classList.add('user__email');
    workValues.appendChild(workName);
    workValues.appendChild(workDesc);


    workItem.id = 'user-' + element.id;
    if (element.portfolio_logo !== 'empty') {
      image.src = workImageLink + element.portfolio_logo;
    } else {
      image.src = '../dest/images/default-background.webp';
    }
    workName.textContent = element.name;
    workDesc.textContent = element.description;
    workItem.appendChild(workImage);
    workItem.appendChild(workValues);
    worksItems.appendChild(workItem);
  }
}

function outError(error, errorField) {
  let errorItem = document.createElement('span');
  errorItem.textContent = error;
  errorField.innerHTML = '';
  errorField.appendChild(errorItem);
}

