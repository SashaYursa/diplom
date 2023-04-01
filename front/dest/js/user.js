
const link = 'http://artist-blog.ua/backend/users';
let userID;
let page = window.location.href.split('/');
page = page[page.length - 2];
window.onload = function () {
  if (page === 'user' && localStorage.getItem('user_token') === null && sessionStorage.getItem('user_token') === null) {
    location = "/front/login/";
  }

  const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
  if (userToken !== 0) {
    main(userToken);
  }
  else {
    userField.innerHTML = 'Увійти';
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
    userName.innerHTML = name;
    email.innerHTML = data['email'];
    created.innerHTML = "Акаунт створено: " + data['created_at'];
  }

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
    console.log(items[i]);
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

async function deletePortfolioItem(id) {
  console.log(id);
  const deleteLink = portfolioLink + '?id=' + id;
  const formData = new FormData();
  formData.append('id', id);

  let response = await fetch(deleteLink, {
    method: 'DELETE',
    body: formData
  });
  return response.json();
}

async function updatePortfolioItem(id) {

}

async function main(userToken) {
  let user = await getUser(link, userToken);

  await outUser(user);

  let loadedItems = await loadUserPortfolio();
  let portfolioItems = document.querySelector('.portfolio__items');
  portfolioItems.innerHTML = '';
  portfolioItems.innerHTML +=
    `
  <div class="portfolio__item add">
    <a href="add-work/" class="portfolio__link add">
      <img id="9" src="../dest/images/add.png" alt="portfolio-item">
    </a>
  </div>
  `
  await addPortfolioItems(loadedItems, portfolioItems);

  let deleteButtons = document.querySelectorAll('.portfolio__delete');
  let editButtons = document.querySelectorAll('.portfolio__edit');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      let id = button.id.split('-')[1];
      let deleted = await deletePortfolioItem(id);
      console.log(deleted);
    });
  });
  editButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      let id = button.id.split('-')[1];
      await updatePortfolioItem(id);
    });
  });

}


