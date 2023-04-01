const portfolioLink = 'http://artist-blog.ua/backend/arts';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const itemID = urlParams.get('id');
let portfolioName = document.getElementById('work-name');
let description = document.getElementById('work-description');
let imageField = document.querySelector('.image__field');
let fileList = [];
let portfolioItem;
function getUserToken() {
  return sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
}

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
  return await response.json();
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
      await removeImage(element.id, portfolioItem, element);
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
  if (imageName === portfolioItem.portfolioLogo) {
    console.log('logo');
    removeFrom = 'logo';
  }
  for (let i = 0; i < portfolioItem.portfolioImages.length; i++) {
    if (portfolioItem.portfolioImages[i] === imageName) {
      console.log('imageee');
      removeFrom = 'images';
    }
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

async function createSendEvent(data) {
  const send = document.querySelector('.work__submit');
  send.addEventListener('click', async e => {
    e.preventDefault();
    let data = new FormData();
    data.append('editedName', portfolioName.value);
    data.append('editedDesc', description.value);
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
    console.log(responseData);
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
  console.log(fileList);
  dragAndDrop.classList.remove('active');
  let status = true;
  if (file != null || file != undefined) {
    fileList.forEach(element => {
      if (element.name === file.name) {
        status = false;
      }
    });
    if (!status) {
      return;
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
    // const imageField = document.querySelector('.image__field');
    // imageField.classList.add('active');
    // imageField.innerHTML += '<img class="selected-image" id="imageField" src="' + url + '" alt="image">';
    // imageField.src = url;
    fileList.push(file);

    imgElement.addEventListener('click', (e) => {
      e.preventDefault();
    });
    imgRemove.addEventListener('click', (e) => {
      e.preventDefault();
      removeImage(imageName, portfolioItem, imgRemove);
    })
  }
}


main(itemID);

async function main(itemID) {
  let userToken = getUserToken();
  if (userToken === 0) {
    return 0;
  }
  portfolioItem = await loadPortfolioItem(itemID, userToken);
  console.log(portfolioItem);
  await outPortfolioItem(portfolioItem);
  await createSendEvent(portfolioItem);
  await createImageEvent(imageField, portfolioItem);
}

// const send = document.querySelector('.work__submit');
// const form = document.querySelector('work__form');
// let fileList = [];
// send.addEventListener('click', e => {
//   e.preventDefault();
//   const token = getUserToken();
//   if (token === 0) {
//     return 0;
//   }
//   const name = document.querySelector('.work__name').value;
//   const description = document.querySelector('.work__description').value;
//   const formData = new FormData();
//   formData.append('userToken', token);
//   formData.append('name', name);
//   formData.append('description', description);
//   formData.append('logo', fileList[0]);
//   fetch(portfolioLink, {
//     method: 'POST',
//     headers: {
//       'status': 'create-portfolio',
//     },
//     body: formData
//   }).then(response => response.json())
//     .then(data => {
//       fileList.shift();
//       if (data['status']) {
//         fileList.forEach(element => {
//           pushImages(data['id'], element);
//         });
//       } else {
//         console.log('Помилка:', data);
//       }
//     });
// });

// function pushImages(id, image) {
//   const formData = new FormData();
//   formData.append('id', id);
//   formData.append('image', image);
//   fetch(portfolioLink, {
//     method: 'POST',
//     headers: {
//       'status': 'add-image-for-portfolio',
//     },
//     body: formData
//   }).then(response => response.json())
//     .then(data => {
//       console.log(data);
//     });
// }





// const dragAndDrop = document.getElementById('dropZone');

// dragAndDrop.addEventListener('dragenter', e => {
//   e.preventDefault();
//   dragAndDrop.classList.add('active');
//   console.log('dragenter');
// });

// dragAndDrop.addEventListener("dragleave", e => {
//   e.preventDefault();
//   dragAndDrop.classList.remove('active');
//   console.log('dragleave');
// });

// dragAndDrop.addEventListener('drop', (e) => {
//   e.preventDefault();
//   let file = e.dataTransfer.files[0];
//   fileHandler(file);

// });

// dragAndDrop.addEventListener('dragover', (e) => { e.preventDefault() }, false);

// const file = document.querySelector('.file__button');

// dragAndDrop.addEventListener('click', (e) => {
//   e.preventDefault();
//   console.log('click');
//   dragAndDrop.classList.add('active');
//   file.click();
// });

// file.addEventListener('change', (e) => {
//   console.log(e);
//   fileHandler(file.files[0]);
// });

// function fileHandler(file) {
//   console.log('as');
//   dragAndDrop.classList.remove('active');
//   if (file != null || file != undefined) {
//     let url = URL.createObjectURL(file);
//     const imageField = document.querySelector('.image__field');
//     imageField.classList.add('active');
//     imageField.innerHTML += '<img class="selected-image" id="imageField" src="' + url + '" alt="image">';
//     imageField.src = url;
//     fileList.push(file);
//   }
// }
