import { QUERY_LINK } from "./backlink.js";
const link = QUERY_LINK + 'articles';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const itemID = urlParams.get('id').replace(/\D/g, "");
let fileList = {};
async function init() {
  await tinymce.init({
    selector: '#add-area',
    toolbar: 'undo redo | blocks fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    plugins: 'image',
    images_file_types: 'jpg,svg,webp,png',
    file_picker_types: 'file image media',
    tinycomments_mode: 'embedded',
    file_picker_types: 'image',
    paste_block_drop: true,
    paste_as_text: true,
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        fileList[file.name] = file;
        const reader = new FileReader();
        reader.addEventListener('load', () => {

          const id = 'blobid' + (new Date()).getTime();
          const blobCache = tinymce.activeEditor.editorUpload.blobCache;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { alt: file.name, title: file.name });
        });
        reader.readAsDataURL(file);
      });
      input.click();
    },
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ]
  });
}

let article;
async function getArticle(id) {
  const newLink = link + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'GET'
  });
  return await response.json();
}
async function main() {
  await init();
  article = await getArticle(itemID);
  console.log(article.text);
  tinymce.get('add-area').setContent(article.text);
  let images = tinymce.get('add-area').dom.select('img');
  images.forEach(element => {
    let split = element.src.split('/');
    element.src = QUERY_LINK + 'articles/images/' + split[split.length - 1];
    element.alt = split[split.length - 1];
  });
  const header = document.querySelector('.article__header');
  header.value = article.name;
  // console.log(d)
}

const saveButton = document.querySelector('.save-button');
saveButton.addEventListener('click', async e => {
  e.preventDefault();
  let textData;
  let areaText = tinymce.get('add-area').getContent({ format: 'text' });
  areaText.length > 450
    ? textData = areaText.slice(0, 450) + '...'
    : textData = areaText;
  let headerText = document.querySelector('.article__header');
  if (textData.length < 20) {
    return tinymce.get('add-area').setContent('Дуже мале наповнення поста заповніть більше');
  }
  if (headerText.value.length < 5) {
    return outError('Заголовок повинен складатися як мінімум з 5 символів', headerText);
  }
  let data = tinymce.get('add-area').getBody();
  let images = data.querySelectorAll('img');
  let currentTime = new Date().getTime();
  let newList = {};
  let oldImages = [];
  images.forEach(element => {
    let randomNum = Math.round(Math.random() * 100);
    let randomNum2 = Math.round(Math.random() * 100);
    if (fileList[element.alt] !== undefined) {
      newList[currentTime + '' + randomNum + randomNum2] = fileList[element.alt];
      element.src = currentTime + '' + randomNum + randomNum2;
    }
    else {
      oldImages.push(element.alt);
    }
  });
  let sendData = tinymce.get('add-area').getContent();
  console.log(newList);

  await sendArticle(sendData, newList, headerText.value, textData, oldImages, article.id);
});
const cancelButton = document.querySelector('.back-button');
cancelButton.addEventListener('click', e => {
  e.preventDefault();
  location = '../';
});
function outError(error, field) {
  field.value = '';
  field.placeholder = error;
  field.classList.add('error');
}

async function sendArticle(article, files, head, desc, oldImages, id) {
  const formData = new FormData();
  if (Object.keys(files).length !== 0) {
    for (const key in files) {
      formData.append(key, files[key]);
    }
  }
  formData.append('id', id);
  formData.append('article', article);
  formData.append('header', head);
  formData.append('desc', desc);
  formData.append('oldImages', JSON.stringify(oldImages));
  let articleLink = QUERY_LINK + 'add-article';
  let response = fetch(articleLink, {
    method: 'POST',
    headers: {
      'Status': 'update-article',
    },
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      if (res.status) {
        location = '../';
      }
    });
}
main();
