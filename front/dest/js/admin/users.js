const usersLink = 'http://artist-blog.ua/backend/admin/users';
const imageLink = 'http://artist-blog.ua/backend/UserImages/';
let { refresh } = await import('./loadItems.js');
async function getUsers() {
  let user = await fetch(usersLink);
  user = await user.json();
}

let ipnutImage;

async function addItemsHandler(userTemplate, userAccess) {
  let deleteButtons = userTemplate.querySelectorAll('.user-delete-button');
  let editeButtons = userTemplate.querySelectorAll('.user-edit-button');
  addDeleteHandler(deleteButtons);
  addEditHandler(editeButtons, userAccess);
}

function addDeleteHandler(buttons) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      if (confirm("Ви точно хочете видалити даного користувача?")) {
        if (await deleteUser(buttonID[1])) {
          await refresh('users');
        }
      }
    });
  });
}

async function deleteUser(id) {
  let newLink = usersLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'DELETE',
  });
  response = await response.json();
  if (response.status) {
    return true;
  }
  return false;
}

function addEditHandler(buttons, userAccess) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      let node = element.parentElement.parentElement;
      editUser(buttonID[1], userAccess);
    });
  });
}

async function editUser($id, userAccess) {
  let newLink = usersLink + '?id=' + $id;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-user',
    }
  });
  response = await response.json();

  let modal = document.getElementById("modal-window");
  modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
  </div>
  `

  let span = document.getElementsByClassName("close")[0];
  modal.classList.add('active');

  span.onclick = function () {
    modal.classList.remove('active');
    document.body.style.position = 'relative';
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove('active');
      document.body.style.position = 'relative';
    }
  }

  let form = createForm();
  const modalContent = document.querySelector('.modal-content');
  const prevEdit = modalContent.querySelector('.user-information__edit');

  if (prevEdit !== null) {
    modalContent.removeChild(prevEdit);
  }

  modalContent.appendChild(form);
  const fileInput = document.getElementById('user-image');
  let userImage = document.getElementById('previev-image');
  let userName = document.getElementById('username');
  let userEmail = document.getElementById('useremail');
  let createdAt = document.getElementById('created-at');
  let userRole = response.is_admin;
  document.body.style.position = 'fixed';

  fileInput.addEventListener('change', (e) => {
    e.preventDefault();
    fileHandler(fileInput.files[0]);
  });

  if (response.user_image !== 'empty') {
    userImage.src = imageLink + response.user_image;
  }
  else {
    userImage.src = '../dest/images/default-background.webp';
  }
  userName.value = response.login;
  userEmail.value = response.email;
  createdAt.value = response.created_at;

  if (userAccess === 2 && response.is_admin < 2) {
    form.querySelector('.edit-choose-role').classList.add('active');
    let select = document.getElementById('role');
    let options = select.querySelectorAll('option');
    for (const i in options) {
      if (options[i].value == response.is_admin) {
        options[i].selected = true;
      }
    }
  }

  let saveButton = document.getElementById('save-change');
  saveButton.addEventListener('click', async e => {
    e.preventDefault();
    let userPassword = document.getElementById('new-password');

    if (userPassword.value.length > 0 && userPassword.value.length < 3) {
      return outErrors('Пароль повинен складатися як мінімум з 3 символів');
    }
    if (userName.value.length < 3) {
      return outErrors('Мінімальна кількість символів для імені 3');
    }

    const validationRegExp = new RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);
    if (!validationRegExp.test(userEmail.value)) {
      return outErrors('Email введено некоректно');
    }
    if (userName.value.length > 100) {
      return outErrors('Максимальна кількість символів для імені 100');
    }
    if (userAccess === 2 && response.is_admin < 2) {
      userRole = document.getElementById('role').value;
    }
    let changedItems = checkModify(userName.value, userEmail.value, userRole, response.login, response.email, response.is_admin);
    if (Object.keys(changedItems).length > 0) {
      let updateData = await updateUser(response.id, changedItems);
      if (updateData.error !== undefined) {
        for (const key in updateData.error) {
          return outErrors(updateData.error[key]);
        }
      }
    }
    else if (userPassword.value.length > 2) {
      let updatePassword = await updateUserPassoword(response.id, userPassword.value);
      if (!updatePassword.status) {
        return outErrors('Помилка, пароль не змінено');
      }
    }
    else if (ipnutImage !== undefined) {
      await saveImage(response.id, ipnutImage);
    }
    else {
      return outErrors('Нічого не змінeно');
    }
    modal.classList.remove('active');
    document.body.style.position = 'relative';
    await refresh('users');
  });

  let cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('active');
    document.body.style.position = 'relative';
  });
}

function createForm() {
  let container = document.createElement('div');
  container.classList.add('user-information__edit');
  let form = `
  <h3 class="user-info-header">Користувач</h3>
  <form class="user-information__form edit-form">
    <label class="edit-lable" for="user-image">Фото</label>
    <div class="user-image-edit">
      <div class="image-preview">
        <img id="previev-image" src="" alt="image">
      </div>
      <button class="user-set-image">
        <input class="image-input" id="user-image" type="file">
        <img src="../dest/images/photo-camera-svgrepo-com.svg" alt="select">
      </button>
    </div>
    <label class="edit-lable" for="username">Ім'я</label>
    <input class="user-informaion__input edit-input" id="username" type="text">
    <label class="edit-lable" for="useremail">Пошта</label>
    <input class="user-informaion__input  edit-input" id="useremail" type="email">
    <label class="edit-lable" for="created-at">Дата створення</label>
    <input class="user-informaion__input  edit-input" id="created-at" type="text" disabled>
    <label class="edit-lable" for="new-password">Новий пароль</label>
    <input class="user-informaion__input  edit-input" id="new-password" type="password" minlength="3">
    <div class="edit-choose-role">
    <label class="edit-lable" for="role">Роль користувача</label>
    <select name="role" id="role">
      <option value="1">Адмін</option>
      <option value="0">Гість</option>
    </select>
    </div>
    <div class="edit-error-field">
      <ul class="error-list">
      </ul>
    </div>
    <div class="edit-action-buttons">
      <input class="edit-action-button" id="save-change" type="submit" value="Зберегти">
      <button class="edit-action-button" id="cancel-button">Назад</button>
    </div>
  </form>
`
  container.innerHTML = form;
  return container;
}

function checkModify(login, email, role, oldLogin, oldEmail, oldRole) {
  let data = {};
  if (login !== oldLogin) {
    data.login = login;
  }
  if (email !== oldEmail) {
    data.email = email;
  }
  if (role != oldRole) {
    data.is_admin = role;
  }
  return data;
}

async function updateUser(userID, data) {
  data.userID = userID
  let response = await fetch(usersLink, {
    method: 'PATCH',
    headers: {
      'status': 'update-user',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function updateUserPassoword(userID, userPassword) {
  let data = {
    userID: userID,
    password: userPassword,
  }
  let response = await fetch(usersLink, {
    method: 'PATCH',
    headers: {
      'status': 'update-password',
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

async function fileHandler(file) {
  let size = file.size / 1024 / 1024;
  if (size > 2) {
    return outErrors('Максимальний розмір файлу 2мб');
  }
  if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif|svg)$/i)) {
    return outErrors('Можна додавати тільки картинки');
  }
  let imageURL = URL.createObjectURL(file);
  let imageField = document.getElementById('previev-image');
  imageField.src = imageURL;
  ipnutImage = file;
}

async function saveImage(userID, image) {
  let userData = new FormData();
  userData.append('userID', userID);
  userData.append('image', image);
  let response = await fetch(usersLink, {
    method: 'POST',
    headers: {
      'status': 'update-image',
    },
    body: userData
  });
}

function outErrors(error) {
  const errorField = document.querySelector('.error-list');
  errorField.innerHTML = '';
  let errorItem = document.createElement('li');
  errorItem.classList.add('error-item');
  errorItem.textContent = error;
  errorField.appendChild(errorItem);
}


export default addItemsHandler;
