const imageLink = 'http://artist-blog.ua/backend/UserImages/';
const portfolioImageLink = 'http://artist-blog.ua/backend/portfolio/logo/';
async function getTemplate(pageName, items, offset, userAccess) {
  let templateContainer;
  let templateHeader;
  let templateBody = document.createElement('tbody');
  if (pageName === 'users') {
    let users = setUsers(items, offset, userAccess, templateContainer, templateHeader, templateBody);

    templateContainer = users.conatainer;
    templateHeader = users.header;
    templateBody = users.body;
  }
  if (pageName === 'works') {
    let works = setWorks(items, offset, userAccess, templateContainer, templateHeader, templateBody);
    templateContainer = works.conatainer;
    templateHeader = works.header;
    templateBody = works.body;
  }
  templateContainer.appendChild(templateBody);
  return templateContainer;
}

function setUsers(items, offset, userAccess, templateContainer, templateHeader, templateBody) {
  templateContainer = document.createElement('table');
  templateContainer.classList.add('content__users-table');
  templateContainer.classList.add('table');
  templateHeader = `
  <thead>
    <tr class="items-header">
      <th class="id">№</th>
      <th>Аватар</th>
      <th>Ім'я</th>
      <th>Email</th>
      <th>Дата реєстрації</th>
      <th>Статус</th>
      <th>Дії</th>
    </tr>
  </thead>
  `;
  templateContainer.innerHTML += templateHeader;

  let index = offset + 1;
  for (const i in items) {

    const element = items[i];

    let tr = document.createElement('tr');
    let userLogin = document.createElement('td');
    let userEmail = document.createElement('td');
    let createdAt = document.createElement('td');
    let roleItem = document.createElement('td');
    let buttons = document.createElement('td');
    let deleteButton = document.createElement('button');
    let editButton = document.createElement('button');
    let userImage = document.createElement('td');
    let imageContainer = document.createElement('div');
    let itemID = document.createElement('td');
    let imageItem = document.createElement('img');
    let image;

    if (element.user_image === 'empty') image = '/front/dest/images/default-background.webp';
    else image = imageLink + element.user_image;
    let role;
    if (element.is_admin == 1) {
      role = 'Адмін';
    }
    else if (element.is_admin == 2) {
      role = 'Супер адмін';
    }
    else {
      role = 'Гість';
    }

    tr.classList.add('item');
    itemID.classList.add('id');
    imageContainer.classList.add('user-image');
    imageItem.src = image;
    imageContainer.appendChild(imageItem);
    userImage.appendChild(imageContainer);
    buttons.classList.add('user-buttons');
    buttons.classList.add('table-buttons');
    deleteButton.classList.add('user-delete-button');
    deleteButton.classList.add('table-delete-button');
    deleteButton.textContent = "Видалити";
    editButton.classList.add('user-edit-button');
    editButton.classList.add('table-edit-button');
    editButton.textContent = "Редагувати";

    tr.appendChild(itemID);
    tr.appendChild(userImage);
    tr.appendChild(userImage);
    tr.appendChild(userLogin);
    tr.appendChild(userEmail);
    tr.appendChild(createdAt);
    tr.appendChild(roleItem);
    tr.appendChild(buttons);

    itemID.textContent = index++;
    userLogin.textContent = element.login;
    userEmail.textContent = element.email;
    createdAt.textContent = element.created_at;
    roleItem.textContent = role;
    editButton.id = 'edit-' + element.id;
    deleteButton.id = 'delete-' + element.id;

    if (element.is_admin == 0) {
      buttons.appendChild(deleteButton);
      buttons.appendChild(editButton);
    }

    if (userAccess == 2) {
      if (element.is_admin == 1) {
        buttons.appendChild(deleteButton);
        buttons.appendChild(editButton);
      }
    }

    templateBody.appendChild(tr);
  }
  return {
    'conatainer': templateContainer,
    'header': templateHeader,
    'body': templateBody,
  };
}

function setWorks(items, offset, userAccess, templateContainer, templateHeader, templateBody) {
  templateContainer = document.createElement('table');
  templateContainer.classList.add('content__works-table');
  templateContainer.classList.add('table');
  templateHeader = `
  <thead>
    <tr class="items-header">
      <th class="id">№</th>
      <th>Логотип</th>
      <th>Назва</th>
      <th>Опис</th>
      <th>Дата створення</th>
      <th>Статус</th>
      <th>Автор</th>
      <th>Дії</th>
    </tr>
  </thead>
  `;
  templateContainer.innerHTML += templateHeader;

  let index = offset + 1;
  for (const i in items) {

    const element = items[i];

    let tr = document.createElement('tr');
    let workImage = document.createElement('td');
    let imageContainer = document.createElement('div');
    let itemID = document.createElement('td');
    let imageItem = document.createElement('img');
    let name = document.createElement('td');
    let description = document.createElement('td');
    let createdAt = document.createElement('td');
    let status = document.createElement('td');
    let statusButton = document.createElement('button');
    let userWhoCreate = document.createElement('td');
    let userWhoCreateContainer = document.createElement('div');
    let userWhoCreateImage = document.createElement('img');
    let userWhoCreateName = document.createElement('span');
    let buttons = document.createElement('td');
    let deleteButton = document.createElement('button');
    let editButton = document.createElement('button');


    let image;

    if (element.portfolio_logo === 'empty' || element.portfolio_logo === undefined) image = '/front/dest/images/default-background.webp';
    else image = portfolioImageLink + element.portfolio_logo;
    let role;

    if (element.user.is_admin == 1) {
      role = 'Адмін';
    }
    else if (element.user.is_admin == 2) {
      role = 'Супер адмін';
    }
    else {
      role = 'Гість';
    }

    tr.classList.add('item');
    itemID.classList.add('id');
    imageContainer.classList.add('user-image');
    imageItem.src = image;
    imageContainer.appendChild(imageItem);
    workImage.appendChild(imageContainer);
    userWhoCreateContainer.appendChild(userWhoCreateImage);
    userWhoCreateContainer.appendChild(userWhoCreateName);
    userWhoCreate.appendChild(userWhoCreateContainer);
    status.appendChild(statusButton);
    statusButton.classList.add('status-button');
    buttons.classList.add('work-buttons');
    buttons.classList.add('table-buttons');
    deleteButton.classList.add('work-delete-button');
    deleteButton.classList.add('table-delete-button');
    deleteButton.textContent = "Видалити";
    editButton.classList.add('work-edit-button');
    editButton.classList.add('table-edit-button');
    editButton.textContent = "Редагувати";
    userWhoCreateContainer.classList.add('work-user-container');


    tr.appendChild(itemID);
    tr.appendChild(workImage);
    tr.appendChild(name);
    tr.appendChild(description);
    tr.appendChild(createdAt);
    tr.appendChild(status);
    tr.appendChild(userWhoCreate);
    tr.appendChild(buttons);

    itemID.textContent = index++;
    name.textContent = element.name;
    description.textContent = element.description;
    createdAt.textContent = element.created_at;
    userWhoCreateName.textContent = element.user.login;
    editButton.id = 'edit-' + element.id;
    deleteButton.id = 'delete-' + element.id;

    if (element.hide === 0) {
      statusButton.textContent = 'Показується';
      statusButton.classList.add('visible');
      statusButton.id = element.id + '-visible';
    }
    if (element.hide === 1) {
      statusButton.textContent = 'Приховано';
      statusButton.classList.add('hide');
      statusButton.id = element.id + '-hide';
    }
    if (element.hide === 2) {
      statusButton.textContent = 'В очікуванні';
      statusButton.classList.add('in-proccess');
      statusButton.id = element.id + '-process';
    }

    if (element.user.user_image === 'empty') {
      userWhoCreateImage.src = '/front/dest/images/default-background.webp';
    }
    else {
      userWhoCreateImage.src = imageLink + element.user.user_image;
    }

    if (element.user.is_admin == 0 || userAccess == 2 && element.user.is_admin == 1) {
      buttons.appendChild(deleteButton);
      buttons.appendChild(editButton);
    }
    else {
      statusButton.disabled = true;
    }

    templateBody.appendChild(tr);
  }
  return {
    'conatainer': templateContainer,
    'header': templateHeader,
    'body': templateBody,
  };
}
export default getTemplate;
