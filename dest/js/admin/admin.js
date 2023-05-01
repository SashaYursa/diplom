import { QUERY_LINK } from '../backlink.js';

let { loadItems } = await import('./loadItems.js');
//Перевірка на те, що користувач дійсно адмін
let user;
const urlParams = new URLSearchParams(window.location.search);
let myParam = urlParams.get('page') || 1;
const ItemsInPage = 15;
let itemsCount = ItemsInPage * (myParam - 1);
let offset = itemsCount * ItemsInPage;

let pageCount;
let itemCount;

let page;

const link = QUERY_LINK + 'users';
const adminLink = QUERY_LINK + 'admin/';
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
if (userToken !== 0) {
  checkUser();
}
else {
  location = "/front/";
}

async function checkUser() {

  user = await getUser(link, userToken);
  if (user.is_admin) {
    return;
  }
  location = "/front/";
}

async function getUser(link, token) {
  let newlink = link + '?token=' + token;
  let response = await fetch(newlink);
  return response.json();
}


const settingsButton = document.querySelector('.sidebar__list-header-button');
const sideBarList = document.querySelector('.sidebar__list');
settingsButton.addEventListener('click', e => {
  e.preventDefault();
  sideBarList.classList.toggle('active');
});

const settingsItems = document.querySelectorAll('.sidebar__button');
settingsItems.forEach(element => {
  element.addEventListener('click', async e => {
    e.preventDefault();
    if (element.classList[1] !== 'active') {
      settingsItems.forEach(item => {
        if (item.classList[1] === 'active') {
          item.classList.remove('active');
        }
      });
      page = element.id;
      await loadItems(page, ItemsInPage, offset, user.is_admin);
      element.classList.add('active');
      await getCountPages(ItemsInPage, page);
      await displayPagination();
    }
  })
});

// Пагінація
function clearActivePagination() {
  let paginationItems = document.querySelectorAll('.pagination__item');
  paginationItems.forEach(element => {
    element.classList.remove('active');
  });
}

async function displayPagination() {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';
  const startElement = document.createElement("a");
  startElement.classList.add('pagination__item');
  startElement.innerText = '«';
  paginationElement.appendChild(startElement);
  startElement.addEventListener('click', async (e) => {
    clearActivePagination();
    startElement.classList.add('active');
    e.preventDefault();
    await loadItems(page, ItemsInPage, 0, user.is_admin);
    window.scrollTo(0, 0)
  });
  for (let i = 0; i < pageCount; i++) {
    let paginationItem = createPaginationItem(i + 1);
    paginationElement.appendChild(paginationItem);

    paginationItem.addEventListener('click', async (e) => {
      e.preventDefault();
      clearActivePagination();
      paginationItem.classList.add('active');
      myParam = paginationItem.innerText;
      offset = (myParam - 1) * ItemsInPage;
      await loadItems(page, ItemsInPage, offset, user.is_admin);
      window.scrollTo(0, 0);
    });
  }
  const endElement = document.createElement("a");
  endElement.classList.add('pagination__item');
  endElement.innerText = '»';
  paginationElement.appendChild(endElement);
  endElement.addEventListener('click', async (e) => {
    e.preventDefault();
    clearActivePagination();
    endElement.classList.add('active');
    myParam = pageCount;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = ItemsInPage * (pageCount - 1);
    await loadItems(page, ItemsInPage, offset, user.is_admin);
    window.scrollTo(0, 0)
  });
}

function createPaginationItem(page) {
  const paginationElement = document.createElement("a");
  paginationElement.classList.add('pagination__item');
  paginationElement.innerText = page;
  if (paginationElement.innerText == myParam) {
    paginationElement.classList.add('active');
  }
  return paginationElement;
}

async function getCountPages(items, page) {
  let newLink = adminLink + page + '?itemsInPage=' + items;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-count-pages',
    }
  })
  response = await response.json();
  pageCount = response.pages;
  itemCount = response.items;
}
