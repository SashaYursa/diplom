import { QUERY_LINK } from "./backlink.js";

const portfolioLink = QUERY_LINK + 'arts';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const itemID = urlParams.get('id').replace(/\D/g, "");
let portfolioName = document.getElementById('work-name');
let description = document.getElementById('work-description');
let imageField = document.querySelector('.image__field');
let fileList = [];
let portfolioItem;
function getUserToken() {
  return sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
}


const backbutton = document.querySelector('.back-button');
backbutton.addEventListener('click', e => {
  e.preventDefault();
  console.log('1231');
  location = '../';
});

async function loadPortfolioItem(itemID, userToken) {
  const requestData = new FormData();
  requestData.append('itemID', itemID);
  requestData.append('userToken', userToken);

  let response = await fetch(portfolioLink, {
    method: 'POST',
    headers: {
      "status": "edit-portfolio-item",
    },
    body: requestData,
  });
  let data = await response.json();
  console.log(data);
  return data;
}

async function outPortfolioItem(data) {
  if (data.portfolioLogo !== 'empty') {
    imageField.classList.add('active');
    let portfolioLogo = await loadImage(data.portfolioLogo, 'logo');
    imageField.appendChild(portfolioLogo);
  }
  if (data.portfolioImages !== undefined || data.portfolioImages.length !== 0) {
    console.log(data.portfolioImages);
    for (let i = 0; i < data.portfolioImages.length; i++) {
      let image = await loadImage(data.portfolioImages[i], 'images');
      imageField.appendChild(image);
    }
    description.innerText = data.portfolioDesc;
    portfolioName.value = data.portfolioName;
  }
}

async function loadImage(imageName, type) {
  let link = portfolioLink + '?name=' + imageName + '&type=' + type;
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-images-for-edit',
    }
  });
  let image = await response.blob();
  image = URL.createObjectURL(image);
  let imgContainer = document.createElement('div');
  let imgElement = document.createElement('img');
  let imgRemove = document.createElement('button');

  imgContainer.classList.add('image-container');
  imgElement.classList.add('selected-image');
  imgRemove.classList.add('delete-image');
  if (type === 'logo') {
    imgElement.classList.add('logo');
  }
  imgElement.src = image;

  imgRemove.id = imageName;
  imgElement.id = imageName;

  imgContainer.appendChild(imgElement);
  imgContainer.appendChild(imgRemove);
  return imgContainer;
}



async function createImageEvent(imageField, portfolioItem) {
  let images = imageField.querySelectorAll('.selected-image');
  images.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let classList = element.classList;
      let hasLogoClass = false;
      classList.forEach(itemClass => {
        if (itemClass === 'logo') {
          hasLogoClass = true;
          console.log(itemClass);
        }
      });
      if (!hasLogoClass) {
        let logoElement = imageField.querySelector('.logo');
        logoElement.classList.remove('logo');
        element.classList.add('logo');
        await setLogo(logoElement.id, element.id);
      }
    });
  });
  let deletes = imageField.querySelectorAll('.delete-image');
  deletes.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let accept = confirm("Ви дійсно хочете видалити картинку?");
      if (accept) {
        await removeImage(element.id, portfolioItem, element);
      }
    });
  });

}

async function setLogo(logoName, imageName) {
  console.log('new-logo');
  let logoData = {
    'oldLogoName': logoName,
    'newLogoName': imageName
  };
  let response = await fetch(portfolioLink, {
    method: 'PATCH',
    headers: {
      "Content-type": "application/json",
      'status': 'update-logo',
    },
    body: JSON.stringify(logoData),
  });
  let data = await response.json();
  console.log(data);

}

async function removeImage(imageName, portfolioItem, element) {
  let imageContainer = element.parentElement;
  let removeFrom = 'user';
  for (let i = 0; i < portfolioItem.portfolioImages.length; i++) {
    if (portfolioItem.portfolioImages[i] === imageName) {
      removeFrom = 'images';
    }
  }
  if (imageContainer.querySelector('img').classList[1] === 'logo') {
    removeFrom = 'logo';
  }

  if (removeFrom !== 'user') {
    if (removeFrom === 'logo') {
      alert('Неможливо видалити логотип, для видалення даного зображення спочатку виберіть інший логотип');
      return;
    }
    let data = {
      'removeFrom': removeFrom,
      'imageName': imageName,
    };
    let response = await fetch(portfolioLink, {
      method: 'DELETE',
      headers: {
        "Content-type": "application/json",
        'status': 'delete-image-in-edit',
      },
      body: JSON.stringify(data)
    });
    let responseData = await response.json();
    console.log(responseData);
    if (responseData.status) {

      imageContainer.remove();
      console.log(imageField.childNodes);
      if (imageField.childNodes.length === 1) {
        imageField.classList.remove('active');
      }
    }
  }
  else {
    let image = imageContainer.querySelector('img');
    fileList = fileList.filter(item => item.name !== image.id);
    imageContainer.remove();
  }
}

async function createSendEvent() {
  const send = document.querySelector('.work__submit');
  send.addEventListener('click', async e => {
    e.preventDefault();
    const name = document.querySelector('.work__name').value;
    const description = document.querySelector('.work__description').value;
    console.log(description.length);
    if (name.length < 5) {
      return outError('Назва має складатися як мінімум з 5 символів');
    }
    if (name.length > 300) {
      return outError('Максимальна кількість символів в назві 300, зараз: ' + name.length);
    }
    if (description.length < 5) {
      return outError('Опис роботи має складатися як мінімум з 5 символів');
    }
    if (description.length > 2000) {
      return outError('Максимальна кількість символів в описі 2000, зараз: ' + description.length);
    }
    let data = new FormData();
    data.append('editedName', portfolioName.value);
    data.append('editedDesc', description);
    data.append('itemID', itemID);
    for (let i = 0; i < fileList.length; i++) {
      data.append('image' + i, fileList[i]);
    }
    let response = await fetch(portfolioLink, {
      method: 'POST',
      headers: {
        'status': 'update-portfolio-item',
      },
      body: data
    });
    let responseData = await response.json();
    if (responseData.res !== undefined) {
      window.location.href = '../';
    }
  });
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
  fileHandler(file.files[0]);
});

function fileHandler(file) {
  dragAndDrop.classList.remove('active');
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
      return outError('Можна додавати тільки картинки');
    }
    let imageName = file.name;

    let image = URL.createObjectURL(file);

    let imgContainer = document.createElement('div');
    let imgElement = document.createElement('img');
    let imgRemove = document.createElement('button');

    imgContainer.classList.add('image-container');
    imgElement.classList.add('selected-image');
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
      let accept = confirm("Ви дійсно хочете видалити картинку?");
      if (accept) {
        removeImage(imageName, portfolioItem, imgRemove);
      }

    })
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



main(itemID);

async function main(itemID) {
  let userToken = getUserToken();
  if (userToken === 0) {
    return 0;
  }
  portfolioItem = await loadPortfolioItem(itemID, userToken);
  if (portfolioItem.portfolioItem !== undefined) {
    window.location.href = '../404/';
  }
  await outPortfolioItem(portfolioItem);
  await createSendEvent(portfolioItem);
  await createImageEvent(imageField, portfolioItem);
}
