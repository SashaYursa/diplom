const portfolioLink = 'http://artist-blog.ua/backend/arts';
const send = document.querySelector('.work__submit');
const form = document.querySelector('work__form');
let fileList = [];
send.addEventListener('click', e => {
  e.preventDefault();
  const token = getUserToken();
  if (token === 0) {
    return 0;
  }
  const name = document.querySelector('.work__name').value;
  const description = document.querySelector('.work__description').value;
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
      } else {
        console.log('Помилка:', data);
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
      console.log(data);
    });
}

function getUserToken() {
  return sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
}



const dragAndDrop = document.getElementById('dropZone');

dragAndDrop.addEventListener('dragenter', e => {
  e.preventDefault();
  dragAndDrop.classList.add('active');
  console.log('dragenter');
});

dragAndDrop.addEventListener("dragleave", e => {
  e.preventDefault();
  dragAndDrop.classList.remove('active');
  console.log('dragleave');
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
  console.log('click');
  dragAndDrop.classList.add('active');
  file.click();
});

file.addEventListener('change', (e) => {
  console.log(e);
  fileHandler(file.files[0]);
});

function fileHandler(file) {
  console.log('as');
  dragAndDrop.classList.remove('active');
  if (file != null || file != undefined) {
    let url = URL.createObjectURL(file);
    const imageField = document.querySelector('.image__field');
    imageField.classList.add('active');
    imageField.innerHTML += '<img class="selected-image" id="imageField" src="' + url + '" alt="image">';
    imageField.src = url;
    fileList.push(file);
  }
}
