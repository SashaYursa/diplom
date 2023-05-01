import { QUERY_LINK } from "./backlink.js";
let fileList = {};
tinymce.init({
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
const textArea = document.getElementById('text-area');
const saveButton = document.querySelector('.save-button');
saveButton.addEventListener('click', async e => {
  e.preventDefault();
  let textData;
  let areaText = tinymce.get('add-area').getContent({ format: 'text' });
  areaText.length > 450
    ? textData = areaText.slice(0, 450) + '...'
    : textData = areaText;
  let headerText = document.querySelector('.article__header');
  const erorrField = document.querySelector('.error');
  if (textData.length < 20) {
    return outError('Дуже мале наповнення поста заповніть більше', erorrField)
  }
  if (headerText.value.length < 5) {
    return outError('Заголовок повинен складатися як мінімум з 5 символів', erorrField);
  }
  let data = tinymce.get('add-area').getBody();
  let images = data.querySelectorAll('img');
  let currentTime = new Date().getTime();
  let newList = {};
  images.forEach(element => {
    let randomNum = Math.round(Math.random() * 100);
    let randomNum2 = Math.round(Math.random() * 100);
    newList[currentTime + '' + randomNum + randomNum2] = fileList[element.alt];
    element.src = currentTime + '' + randomNum + randomNum2;
  });
  let sendData = tinymce.get('add-area').getContent();

  await sendArticle(sendData, newList, headerText.value, textData);
});
const cancelButton = document.querySelector('.back-button');
cancelButton.addEventListener('click', e => {
  e.preventDefault();
  location = '../';
});
function outError(error, field) {
  field.textContent = error;
}

async function sendArticle(article, files, head, desc) {
  const formData = new FormData();
  if (Object.keys(files).length !== 0) {
    for (const key in files) {
      formData.append(key, files[key]);
    }
  }
  formData.append('article', article);
  formData.append('header', head);
  formData.append('desc', desc);
  let articleLink = QUERY_LINK + 'add-article';
  let response = fetch(articleLink, {
    method: 'POST',
    headers: {
      'Status': 'add-article',
    },
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      if (res.res.articles.ok) {
        location = '../';
      }
    });
  //response = await response.json();
  //console.log(response);
}


