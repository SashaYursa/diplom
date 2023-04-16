
const link = 'http://artist-blog.ua/backend/users';
let userID;
let user;
let page = window.location.href.split('/');
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
if (userToken !== 0) {
  main(userToken);
}
page = page[page.length - 2];
window.onload = function () {
  if (page === 'user' && localStorage.getItem('user_token') === null && sessionStorage.getItem('user_token') === null) {
    location = "/front/login/";
  }
}

async function getUser(link, token) {
  let newlink = link + '?token=' + token;
  let response = await fetch(newlink);
  return response.json();
}
async function outUser(data) {
  let user = document.getElementById('login');

  userID = data['id'];
  let name = data['login'];
  user.innerHTML = name;
  user.setAttribute('href', '/front/user');
  if (page === 'user') {
    let userName = document.getElementById('name');
    let email = document.getElementById('email');
    let created = document.getElementById('created-at');
    let edituserName = document.getElementById('username');
    let editemail = document.getElementById('useremail');
    edituserName.value = data['login'];
    editemail.value = data['email'];
    userName.innerHTML = name;
    email.innerHTML = data['email'];
    created.innerHTML = "Акаунт створено: " + data['created_at'];
  }
  let imageField = document.getElementById('user-information-image');
  let imageFieldEdit = document.getElementById('previev-image');

  let userImage = await loadUserImage(data);
  imageField.src = userImage;
  imageFieldEdit.src = userImage;

}
async function loadUserImage(user) {

  if (user['user_image'] === 'empty') {
    return '/front/dest/images/default-background.webp';
  }
  let reqestLink = link + '?imageName=' + user['user_image'];
  let responseData = await fetch(reqestLink, {
    method: 'GET',
  });
  responseData = await responseData.blob();
  let url = URL.createObjectURL(responseData);
  return url;
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

const editButton = document.querySelector('.edit-button');
const cancelButton = document.getElementById('cancel-button');
const saveChangeButton = document.getElementById('save-change');
const informationContainer = document.querySelector('.user-information__data');
const editContainer = document.querySelector('.user-information__edit');
const fileInput = document.getElementById('user-image');
let userImage;

async function createEditEvents(data) {
  let edituserName = document.getElementById('username');
  let editemail = document.getElementById('useremail');
  let editImage = document.getElementById('previev-image');
  let oldPassword = document.getElementById('old-password');
  let newPassword = document.getElementById('new-password');
  fileInput.addEventListener('change', (e) => {
    e.preventDefault();
    fileHandler(fileInput.files[0]);
  });
  editButton.addEventListener('click', e => {
    e.preventDefault();

    if (user['user_image'] === 'empty') {
      editImage.src = '/front/dest/images/default-background.webp';
    }

    informationContainer.classList.remove('active');
    editContainer.classList.add('active');
  });
  cancelButton.addEventListener('click', async e => {
    e.preventDefault();
    informationContainer.classList.add('active');
    editContainer.classList.remove('active');
    userImage = undefined;
    await outUser(await getUserData(userToken));
  });
  saveChangeButton.addEventListener('click', async e => {
    e.preventDefault();
    const errorField = document.querySelector('.error-list');
    errorField.innerHTML = '';
    let dataArray = {};
    if (userImage !== undefined) {
      dataArray.image = userImage;
    }
    if (edituserName.value !== user['login']) {
      dataArray.name = edituserName.value;
    }
    if (editemail.value !== user['email']) {
      dataArray.email = editemail.value;
    }
    if (oldPassword.value.length >= 3) {
      dataArray.oldPassword = oldPassword.value;
    }
    if (newPassword.value.length >= 3) {
      dataArray.newPassword = newPassword.value;
    }
    console.log(edituserName.value.length, 'lenght');
    if (edituserName.value.length < 3) {
      return outError('Мінімальна кількість символів для імені 3');
    }
    const validationRegExp = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);
    if (!validationRegExp.test(editemail.value)) {
      return outError('Email введено некоректно');
    }

    if (oldPassword.value.length > 0 && oldPassword.value.length < 3) {
      return outError('Пароль повинен складатися як мінімум з 3 символів');
    }
    if (newPassword.value.length > 0 && newPassword.value.length < 3) {
      return outError('Новий пароль повинен складатися як мінімум з 3 символів');
    }
    if (newPassword.value.length > 0 && oldPassword.value.length === 0 || oldPassword.value.length > 0 && newPassword.value.length === 0) {
      return outError('Для зміни паролю потрібо заповнити два поля з паролями');
    }

    if (Object.keys(dataArray).length > 0) {
      dataArray.oldLogin = user.login;
      let userData = new FormData();
      userData.append('userID', userID);
      userData.append('login', user['login']);
      for (const [key, val] of Object.entries(dataArray)) {
        userData.append(key, val);
      }
      let response = await fetch(link, {
        method: 'POST',
        headers: {
          'status': 'update-user',
        },
        body: userData
      });
      let responseData = await response.json();
      console.log(responseData);
      if (responseData.status) {
        editContainer.classList.remove('active');
        informationContainer.classList.add('active');
        userImage = undefined;
        const successField = document.querySelector('.success-list');
        successField.innerHTML = '';
        for (let item in responseData.success) {
          outSuccess(responseData.success[item].message, successField);
        }
      }

      else {
        for (let item in responseData.errors) {
          outError(responseData.errors[item]);
        }
      }

      dataArray = '';
      oldPassword.value = '';
      newPassword.value = '';
      user = await getUserData(userToken);
      await outUser(user);
    }
  });
}



async function fileHandler(file) {
  let size = file.size / 1024 / 1024;
  if (size > 2) {
    return outError('Максимальний розмір файлу 2мб');
  }
  if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif|svg)$/i)) {
    return outError('Можна додавати тільки картинки');
  }
  let imageURL = URL.createObjectURL(file);
  let imageField = document.getElementById('previev-image');
  imageField.src = imageURL;
  userImage = file
}

function outError(error) {
  const errorField = document.querySelector('.error-list');
  let errorItem = document.createElement('li');
  errorItem.classList.add('error-item');
  errorItem.textContent = error;
  errorField.appendChild(errorItem);
}

function outSuccess(success, successField) {
  let successItem = document.createElement('li');
  successItem.classList.add('success-item');
  successItem.textContent = success;
  successField.appendChild(successItem);
}


// вивід портофоліо

const portfolioLink = 'http://artist-blog.ua/backend/arts';
let data;
const limit = 15;
let offset = 0;


async function loadUserPortfolio() {
  let link = portfolioLink + '?id=' + userID + '&limit=' + limit + '&offset=' + offset;
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-user-portfolio",
    }
  });
  let data = await response.json();
  return data['items'];
}
async function loadPortfolioImages(image) {
  let link = portfolioLink + '?name=' + image;
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-image",
    }
  });
  let data = await response.blob();
  let url = URL.createObjectURL(data);
  return url;
}
async function addPortfolioItems(items, itemsBody) {
  for (let i = 0; i < items.length; i++) {
    let image;
    if (items[i]['portfolio_logo'] === 'empty') {
      image = '../dest/images/default-background.webp';
    }
    else {
      image = await loadPortfolioImages(items[i]['portfolio_logo']);
    }
    itemsBody.innerHTML += `
    <div class="portfolio__item">
        <a href="" class="portfolio__link">
          <img id="image-${items[i]['id']}" src="${image}" alt="portfolio-item">
          <div class="item__edit">
            <button onclick="location.href='edit-work/?id=${items[i]['id']}'" class="portfolio__details portfolio__edit" id="edit-${items[i]['id']}">
              Редагувати
            </button>
            <button class="portfolio__details portfolio__delete" id="delete-${items[i]['id']}">
              Видалити
            </button>
            <span class="portfolio__id" id="itemID9" hidden></span>
          </div>
        </a>
      </div>
      `;
  }
}

async function deletePortfolioItem(id, button) {
  let element = button.parentElement.parentElement.parentElement;
  const deleteLink = portfolioLink + '?id=' + id;
  const formData = new FormData();
  formData.append('id', id);

  let response = await fetch(deleteLink, {
    method: 'DELETE',
    body: formData
  });
  let res = await response.json();
  if (res.status) {
    let elementBody = document.querySelector('.portfolio__items');
    elementBody.removeChild(element);
  }
}

async function getUserData(userToken) {
  let user = await getUser(link, userToken);
  if (user.error !== undefined) {
    location = '/front/login/';
  }
  return user;
}

function outAdmin() {
  let buttonField = document.querySelector('.user-information__buttons');
  let adminButton = document.createElement('button');
  adminButton.classList.add('user-information__button');
  adminButton.classList.add('admin-button');
  adminButton.innerHTML = 'Адмін панель';
  buttonField.appendChild(adminButton);
  adminButton.addEventListener('click', e => {
    e.preventDefault();
    location = "/front/admin/";
  });
}


async function main(userToken) {
  user = await getUserData(userToken);

  await outUser(user);
  if (user.is_admin) {
    outAdmin();
  }
  let loadedItems = await loadUserPortfolio();
  let portfolioItems = document.querySelector('.portfolio__items');
  portfolioItems.innerHTML = '';
  portfolioItems.innerHTML += `
  <div class="portfolio__item add">
    <a href="add-work/" class="portfolio__link add">
      <img src="../dest/images/add.png" alt="portfolio-item">
    </a>
  </div>
  `
  await addPortfolioItems(loadedItems, portfolioItems);

  const deleteButtons = document.querySelectorAll('.portfolio__delete');
  const editButtons = document.querySelectorAll('.portfolio__edit');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      let id = button.id.split('-')[1];
      await deletePortfolioItem(id, button);
    });
  });
  editButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
    });
  });
  await createEditEvents(user);
}


