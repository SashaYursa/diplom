const portfolioLink = 'http://artist-blog.ua/backend/arts';
const send = document.querySelector('.work__submit');
const form = document.querySelector('work__form');
let fileList = [];
send.addEventListener('click', e => {
  e.preventDefault();
  const token = getUserToken();
  if (token === 0) {
    window.location.href = '/front/404/';
  }
  const name = document.querySelector('.work__name').value;
  const description = document.querySelector('.work__description').value;
  console.log(description.length);
  if (name.length < 5) {
    return outError('Назва має складатися як мінімум з 5 символів');
  }
  if (name.length > 100) {
    return outError('Максимальна кількість символів в назві 100, зараз: ' + name.length);
  }
  if (description.length < 5) {
    return outError('Опис роботи має складатися як мінімум з 5 символів');
  }
  if (description.length > 2000) {
    return outError('Максимальна кількість символів в описі 2000, зараз: ' + description.length);
  }
  if (fileList.length === 0) {
    return outError('Потрібно додати хоч 1 фотографію');
  }
  const formData = new FormData();
  formData.append('userToken', token);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('logo', fileList[0]);
  fetch(portfolioLink, {
    method: 'POST',
    headers: {
      'status': 'create-portfolio',
    },
    body: formData
  }).then(response => response.json())
    .then(data => {
      fileList.shift();
      if (data['status']) {
        fileList.forEach(element => {
          pushImages(data['id'], element);
        });
        window.location.href = '/front/user';
      } else {
        outError('Помилка при додаванні');
      }
    });
});

function pushImages(id, image) {
  const formData = new FormData();
  formData.append('id', id);
  formData.append('image', image);
  fetch(portfolioLink, {
    method: 'POST',
    headers: {
      'status': 'add-image-for-portfolio',
    },
    body: formData
  }).then(response => response.json())
    .then(data => {
      if (!data.status) {
        return outError(data.message);
      }
    });
}

function getUserToken() {
  return sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
}

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
});

dragAndDrop.addEventListener('dragover', (e) => { e.preventDefault() }, false);

const file = document.querySelector('.file__button');

dragAndDrop.addEventListener('click', (e) => {
  e.preventDefault();
  dragAndDrop.classList.add('active');
  file.click();
});

file.addEventListener('change', (e) => {
  e.preventDefault();
  fileHandler(file.files[0]);
});

function fileHandler(file) {
  dragAndDrop.classList.remove('active');

  if (file != null || file != undefined) {
    let size = file.size / 1024 / 1024;
    if (size > 5) {
      return outError('Максимальний розмір файлу 5мб');

    }
    if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
      return outError('Можна додавати тільки картинки');

    }

    let url = URL.createObjectURL(file);
    const imageField = document.querySelector('.image__field');
    imageField.classList.add('active');
    imageField.innerHTML += '<img class="selected-image" id="imageField" src="' + url + '" alt="image">';
    imageField.src = url;
    fileList.push(file);
    console.log(fileList, 'filelist');
  }
}

function outError(error) {
  let errorList = document.querySelector('.work__image-error');
  errorList.innerHTML = '';
  let errorNode = document.createElement('li');
  errorNode.classList.add('error-text');
  errorNode.textContent = error;
  errorList.appendChild(errorNode);
}
