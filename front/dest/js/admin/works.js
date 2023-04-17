const worksLink = 'http://artist-blog.ua/backend/admin/works';
const userImageLink = 'http://artist-blog.ua/backend/UserImages/';
const workImagesLink = 'http://artist-blog.ua/backend/portfolio/';
let { refresh } = await import('./loadItems.js');
let fileList = [];

async function addItemsHandler(userTemplate, userAccess) {
  const deleteButtons = userTemplate.querySelectorAll('.work-delete-button');
  const editeButtons = userTemplate.querySelectorAll('.work-edit-button');
  const statusButtons = userTemplate.querySelectorAll('.status-button');
  addDeleteHandler(deleteButtons);
  addEditHandler(editeButtons, userAccess);
  addStatusHandler(statusButtons);
}


function addDeleteHandler(buttons) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      if (confirm("Ви точно хочете видалити дану роботу?")) {
        if (await deleteWork(buttonID[1])) {
          await refresh('works');
        }
      }
    });
  });
}

async function deleteWork(id) {
  let newLink = worksLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'DELETE',
    headers: {
      'status': 'delete-work',
    }
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
      let work = await getWork(buttonID[1]);
      editWork(work, userAccess);
    });
  });
}
async function getWork(id) {
  let newLink = worksLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-work',
    }
  });
  return await response.json();
}

async function editWork(work) {
  let user = work.user;
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
  const prevEdit = modalContent.querySelector('.work-information__edit');

  if (prevEdit !== null) {
    modalContent.removeChild(prevEdit);
  }
  modalContent.appendChild(form);
  document.body.style.position = 'fixed';

  let userImage = document.getElementById('user-img');
  let userName = document.getElementById('username');
  let userEmail = document.getElementById('useremail');
  let userRole = document.getElementById('userrole');
  userName.textContent = user.login;
  userEmail.textContent = user.email;
  if (user.image === 'empty') {
    userImage.src = '../dest/images/default-background.webp'
  }
  else {
    userImage.src = userImageLink + user.image;
  }
  if (user.is_admin == 1) {
    userRole.textContent = 'Адмін';
  }
  else if (user.is_admin == 2) {
    userRole.textContent = 'Суперадмін';
  }
  else {
    userRole.textContent = 'Гість';
  }

  let workName = document.getElementById('work-name');
  let workDesc = document.getElementById('work-description');
  let workImages = document.getElementById('work-images');
  workName.value = work.name;
  workDesc.value = work.description;

  let images = addImages(work, workImages);
  images.forEach(image => {
    addDeleteItem(image);
    addSetLogoEvent(image, work.id);
  });

  dragAndDropEvent();

  let saveButton = document.getElementById('save-change');
  saveButton.addEventListener('click', async e => {
    e.preventDefault();
    let data = new FormData();
    if (workName.value.length < 5) {
      return outError('Назва роботи повинна складатися як мінімум з 5 символів');
    }
    if (workName.value.length > 300) {
      return outError('Назва роботи повинна складатися максимум з 300 символів');
    }
    if (workDesc.value.length < 5) {
      return outError('Опис роботи повинен складатися як мінімум з 5 символів');
    }
    if (workDesc.value.length > 2000) {
      return outError('Опис роботи повинен складатися максимум з 2000 символів');
    }
    if (workName.value !== work.name) {
      data.append('workName', workName.value);
    }
    if (workDesc.value !== work.description) {
      data.append('workDesc', workDesc.value);
    }
    if (fileList.length > 0) {
      let i = 0;
      fileList.forEach(element => {
        data.append(i, element);
        i++;
      });
    }
    data.append('itemID', work.id);
    let response = await fetch(worksLink, {
      method: 'POST',
      headers: {
        'status': 'update-portfolio-item',
      },
      body: data
    });
    let responseData = await response.json();
    if (responseData.res) {
      modal.classList.remove('active');
      document.body.style.position = 'relative';
      await refresh('works');
    }

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
  container.classList.add('work-information__edit');
  let userInfo = `
  <h3 class="user-info-header">Автор</h3>
  <div class="user-info">
    <div class="user-image">
      <img id="user-img" src="../dest/images/background-image.png" alt="">
    </div>
    <span class='user-info-item login' id="username"></span>
    <span class='user-info-item email' id="useremail"></span>
    <span class='user-info-item status' id="userrole"></span>
  </div>
  `
  let form = `
  <h3 class="user-info-header">Робота</h3>
  <form class="work-information__form edit-form">
    <label for="work-name" class="edit-lable">Назва</label>
    <input class="work__name edit-input" id="work-name" name="work-name" type="text" placeholder="Назва роботи">
    <label for="work-description" class="edit-lable">Опис</label>
    <textarea class="work__description edit-input" id="work-description" name="work-description"
        placeholder="Опис роботи">
    </textarea>
    <label class="edit-lable" for="logo">Картинки</label>
    <input class="file__button" id="logo" type="file" hidden>
    <div class="work__image" id="dropZone">
      Для завантаження натисніть, або перетягніть файл сюди
    </div>
    <div class="image__field" id="work-images">
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
  container.innerHTML = userInfo;
  container.innerHTML += form;
  return container;
}

function addImages(work, field) {
  let images = [];
  let portfolioLogo = document.createElement('div');
  let portfolioLogoImage = document.createElement('img');
  portfolioLogo.classList.add('logo');
  portfolioLogo.classList.add('selected-image');
  portfolioLogoImage.src = workImagesLink + 'logo/' + work.portfolio_logo;
  portfolioLogo.appendChild(portfolioLogoImage);
  portfolioLogo.id = work.id;
  field.appendChild(portfolioLogo);

  for (const image of work.images) {
    let portfolioItem = document.createElement('div');
    let portfolioItemImage = document.createElement('img');
    portfolioItem.classList.add('selected-image');
    portfolioItemImage.src = workImagesLink + 'images/' + image.image_name;
    portfolioItem.appendChild(portfolioItemImage);
    portfolioItem.id = image.id;
    field.appendChild(portfolioItem);
    images.push(portfolioItem);
  }
  return images;
}


function dragAndDropEvent() {
  const dragAndDrop = document.getElementById('dropZone');

  dragAndDrop.addEventListener('dragenter', e => {
    e.preventDefault();
    dragAndDrop.classList.add('active');
  });

  dragAndDrop.addEventListener("dragleave", e => {
    e.preventDefault();
    dragAndDrop.classList.remove('active');
  });

  dragAndDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    fileHandler(file);
    dragAndDrop.classList.remove('active');
  });

  dragAndDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragAndDrop.classList.remove('active');
  }, false);

  const file = document.querySelector('.file__button');

  dragAndDrop.addEventListener('click', (e) => {
    e.preventDefault();
    dragAndDrop.classList.add('active');
    file.click();
  });

  file.addEventListener('change', (e) => {
    e.preventDefault();
    dragAndDrop.classList.remove('active');
    fileHandler(file.files[0]);
  });
}

function fileHandler(file) {
  let status = true;
  if (file != null || file != undefined) {
    fileList.forEach(element => {
      if (element.name === file.name) {
        status = false;
      }
    });
    let size = file.size / 1024 / 1024;
    if (size > 5) {
      return outError('Максимальний розмір файлу 5мб');
    }
    if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif|svg)$/i)) {
      return outError('Можна додавати тільки картинки');
    }
    if (!status) {
      return outError('Таке зображення вже додано');
    }
    outAddedImages(file);
  }
}

function outAddedImages(file) {
  let imageField = document.querySelector('.image__field');
  let imageName = file.name;

  let image = URL.createObjectURL(file);

  let imgContainer = document.createElement('div');
  let imgElement = document.createElement('img');
  let imgRemove = document.createElement('button');

  imgContainer.classList.add('selected-image');
  imgRemove.classList.add('delete-image');

  imgElement.src = image;

  imgRemove.id = imageName;
  imgElement.id = imageName;

  imgContainer.appendChild(imgElement);
  imgContainer.appendChild(imgRemove);
  imageField.appendChild(imgContainer);
  fileList.push(file);

  imgElement.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Дану картинку можна зробити логотипом тільки після завантаження на сервер');
  });
  imgRemove.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Ви дійсно хочете видалити картинку?")) {
      removeImage(imgContainer, 'user');
    }
  })
}

async function removeImage(imageContainer, from) {
  if (from === 'server') {
    let newLink = worksLink + '?id=' + imageContainer.id;
    let response = await fetch(newLink, {
      method: 'DELETE',
      headers: {
        'status': 'delete-image'
      }
    });
    response = await response.json();
    if (response.ok !== undefined) {
      imageContainer.remove();
    }
  }
  else if (from === 'user') {
    let image = imageContainer.querySelector('img');
    fileList = fileList.filter(item => item.name !== image.id);
    imageContainer.remove();
  }
}



function addSetLogoEvent(image, id) {
  image.addEventListener('click', async e => {
    e.preventDefault();
    let classList = image.classList;
    let hasLogoClass = false;
    classList.forEach(itemClass => {
      if (itemClass === 'logo') {
        hasLogoClass = true;
      }
    });
    if (!hasLogoClass) {
      if (confirm("Ви дійсно хочете зробити дану картинку головною?")) {
        let logoElement = document.querySelector('.logo');
        logoElement.classList.remove('logo');
        image.classList.add('logo');
        let res = await setLogo(logoElement.id, image.id);
        if (res.ok) {

          editWork(await getWork(id));
          fileList = [];
        }
      }
    }
  });
}

async function setLogo(logoName, imageName) {
  let logoData = {
    'oldLogoName': logoName,
    'newLogoName': imageName
  };
  let response = await fetch(worksLink, {
    method: 'PATCH',
    headers: {
      "Content-type": "application/json",
      'status': 'update-logo',
    },
    body: JSON.stringify(logoData),
  });
  return await response.json();
}


function addDeleteItem(image) {
  let imgRemove = document.createElement('button');
  imgRemove.classList.add('delete-image');
  image.appendChild(imgRemove);
  imgRemove.addEventListener('click', e => {
    e.preventDefault();
    if (confirm("Ви дійсно хочете видалити картинку?")) {
      removeImage(image, 'server');
    }
  });
}

function outError(error) {
  const errorField = document.querySelector('.error-list');
  errorField.innerHTML = '';
  let errorItem = document.createElement('li');
  errorItem.classList.add('error-item');
  errorItem.textContent = error;
  errorField.appendChild(errorItem);
}

function addStatusHandler(buttons) {
  buttons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      const id = button.id.split('-');
      let response = await fetch(worksLink, {
        method: 'PATCH',
        headers: {
          'status': 'update-status'
        },
        body: JSON.stringify({
          'workID': id[0],
          'status': id[1],
        })
      });
      response = await response.json();
      if (response.status) {
        alert(response.message);
        await refresh('works');
      }
    });
  });
}

export default addItemsHandler;
