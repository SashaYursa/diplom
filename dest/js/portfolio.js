import { QUERY_LINK } from "./backlink.js";
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
const userImageLink = QUERY_LINK + 'UserImages/';
const portfolioLink = QUERY_LINK + 'arts';
const userLink = QUERY_LINK + 'users';
let data;
let user;
async function getUser(token) {
  let newlink = userLink + '?token=' + token;
  let response = await fetch(newlink);
  return await response.json();
}

const urlParams = new URLSearchParams(window.location.search);
let myParam = urlParams.get('page') || 1;
const ItemsInPage = 15;
let itemsCount = ItemsInPage * (myParam - 1);
let offset = itemsCount + ItemsInPage;

let pageCount;
let pages;

loadData(1);


async function loadData(page) {
  await getCountPages(ItemsInPage);
  await loadImages(page);
  addPopups();
  user = await getUser(userToken);
  console.log(user);
  displayPagination();
}

async function getCountPages(items) {
  let newLink = portfolioLink + '?itemsInPage=' + items;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-count-pages",
    }
  });
  const responseData = await response.json();
  pageCount = responseData.countPages;
  pages = responseData.pages;
}

async function displayPagination() {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';
  const startElement = document.createElement("a");

  startElement.classList.add('pagination__item');
  startElement.innerText = '«';
  paginationElement.appendChild(startElement);
  startElement.addEventListener('click', (e) => {
    e.preventDefault();
    myParam = 1;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = itemsCount + ItemsInPage;
    loadData(1);
    window.scrollTo(0, 0)
  });

  for (let i = 0; i < pageCount; i++) {
    let paginationItem = createPaginationItem(i + 1);
    paginationElement.appendChild(paginationItem);
    paginationItem.addEventListener('click', (e) => {
      e.preventDefault();

      myParam = paginationItem.innerText;
      itemsCount = ItemsInPage * (myParam - 1);
      offset = itemsCount + ItemsInPage;
      loadData(i + 1);
      window.scrollTo(0, 0);
    });
  }

  const endElement = document.createElement("a");
  endElement.classList.add('pagination__item');
  endElement.innerText = '»';
  paginationElement.appendChild(endElement);
  endElement.addEventListener('click', (e) => {
    e.preventDefault();
    myParam = pageCount;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = itemsCount + ItemsInPage;
    loadData(pageCount);
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

function createElement(id, portfolioItems) {
  portfolioItems.innerHTML += `
  <div class="portfolio__item" id="portfolio-item-${id + 1}">
  <a href="#popup" class="portfolio__link">
    <img class="portfolio__image" id="${id + 1}" src="../dest/images/default-background.webp" alt="portfolio-item">
    <span class="portfolio__details" id="desc${id + 1}">Дивитися</span>
    <span class="portfolio__id" hidden id="itemID${id + 1}"></span>
  </a>
</div>
  `;
}

async function addImageInfo(item, id) {
  let newLink = portfolioLink + '?item=' + item;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info",
    }
  });
  if (response.ok) {
    let data = await response.json();
    const imageItem = document.getElementById('desc' + (id + 1));
    const imageItemID = document.getElementById('itemID' + (id + 1));
    imageItem.innerText = data['name'];
    imageItemID.innerText = data['id'];
    if (data['res'] != undefined) {
      imageItem.innerText = data['res']['name'];
      imageItemID.innerText = data['res']['id'];
    }
    return data;
  }
  return false;

}
async function loadImages(page) {

  const portfolioItems = document.querySelector('.portfolio__items');
  portfolioItems.innerHTML = '';
  for (const i in pages[page]) {
    createElement(i, portfolioItems);
    let data = await addImageInfo(pages[page][i].id, i);
    if (data['res'] != undefined) {
      await addImage(i, data.portfolio_logo, false);
    } else {
      await addImage(i, data.portfolio_logo);
    }
  }
}
async function addImage(item, link, data = true) {
  if (!data) {
    const imageItem = document.getElementById(item + 1);
    imageItem.src = '../dest/images/default-background.webp';
  }
  else {
    const logoLink = QUERY_LINK + 'portfolio/logo/' + link;
    const imageItem = document.getElementById(item + 1);
    imageItem.src = logoLink;
  }
}
/////////////////////////////////////////////////////////////////
//popup

const body = document.querySelector('body');
const wrapper = document.querySelectorAll('.wrapper');
const lockPadding = document.querySelectorAll('.lock-padding');
let unlock = true;
const timeout = 300;

function addPopups() {
  let popupLinks = document.querySelectorAll('.portfolio__link');

  if (popupLinks.length > 0) {
    popupLinks.forEach(popupLink => {
      popupLink.addEventListener('click', (e) => {
        e.preventDefault();
        let popupName = popupLink.getAttribute('href').replace('#', '');
        let itemID = popupLink.querySelector('.portfolio__id').textContent;
        let currentPopup = document.getElementById(popupName);
        popupSetInforamation(currentPopup, itemID);
        popupOpen(currentPopup);
      })
    });
  }
}

const popupCloseIcons = document.querySelectorAll('.close-popup');
if (popupCloseIcons.length > 0) {
  popupCloseIcons.forEach(popupCloseIcon => {
    popupCloseIcon.addEventListener('click', (e) => {
      popupClose(popupCloseIcon.closest('.popup'));
      e.preventDefault();
    });
  });
}

function popupOpen(currentPopup) {
  if (currentPopup && unlock) {
    const popupActive = document.querySelector('.popup.open');
    if (popupActive) {
      popupClose(popupActive, false);
    }
    else {
      bodyLock();
    }

    currentPopup.classList.add('open');
    currentPopup.addEventListener("click", (e) => {
      if (!e.target.closest('.popup__content')) {
        popupClose(e.target.closest('.popup'));
      }
    });
  }
}

function popupClose(popupActive, doUnlock = true) {
  if (unlock) {
    popupActive.classList.remove('open');
    if (doUnlock) {
      bodyUnlock();
    }
  }
}

function bodyLock() {
  const lockPaddingValue = '100%';
  if (lockPadding.length > 0) {
    lockPadding.forEach(item => {
      item.style.paddingRight = lockPaddingValue;
      item.style.opacity = 0;
    });
  }
  wrapper.forEach(element => {
    element.style.opacity = '0';
  });
  body.style.overflowY = 'hidden';
  body.classList.add('lock');
  body.style.paddingRight = '17px';
  unlock = true;
}

function bodyUnlock() {
  lockPadding.forEach(element => {
    element.style.paddingRight = '0px';
    element.style.opacity = 1;
  });
  wrapper.forEach(element => {
    element.style.opacity = '1';
  });
  body.style.overflowY = 'auto';;
  body.style.paddingRight = '0px';
  body.classList.remove('lock');
}

//popup вивід інформації

async function popupSetInforamation(currentPopup, itemID) {

  let popupInfo = await getInfoForPopup(itemID);
  currentPopup.innerHTML = `
  <div class="popup__body">
    <a href="##" class="popup__area"></a>
    <div class="popup__content">
    <div class="popup__portfolio">
      <a href="##" class="popup__close close-popup">&times;</a>
      <div class="popup__title"></div>
      <img class="popup__image" src="" alt="main-img">
      <div class="popup__text"></div>
    </div>
    <h3 class="popup__title user-title">Автор</h3>
    <div class="popup__user">
      <div class="user__image">
        <img class="user-img" src="../dest/images/default-background.webp" alt="user-image"/>
      </div>
      <span class="user-field user-name"></span>
      <span class="user-field user-email"></span>
    </div>
    <div class="likes">
      <span class="like-count"></span>
      <button class="like-button"><img class="like-img" src="../dest/images/like.png"/></button>
    </div>
  </div>

  </div>
  `;
  setPopupInfo(popupInfo, currentPopup);
  let logoImg = new Image();
  let popupLogo = await popupLoadLogo(itemID);
  if (popupLogo['status'] === false) {
    logoImg.src = '../dest/images/default-background.webp';
  } else {
    logoImg.src = URL.createObjectURL(popupLogo);
  }
  await logoImg.decode();
  const popupContent = document.querySelector('.popup__portfolio');
  const popupImage = document.querySelector('.popup__image');
  popupImage.src = logoImg.src;
  formattedImages(popupContent, popupImage);

  for (let index = 0; index < popupInfo.countImages; index++) {

    let popupImage = await popupLoadImages(itemID, index);
    let img = new Image();
    img.src = URL.createObjectURL(popupImage);
    await img.decode();
    popupContent.innerHTML += `<img class="popup__image" id="image${index + 1}" src="${img.src}" alt="main-img">`;
    let popupImageItem = document.getElementById('image' + (index + 1));
    formattedImages(popupContent, popupImageItem);
  }

  if (popupInfo.user.user_image != 'empty') {
    const userImage = document.querySelector('.user-img');
    userImage.src = userImageLink + popupInfo.user.user_image;
  }
  const userName = document.querySelector('.user-name');
  userName.textContent = popupInfo.user.login;
  const userEmail = document.querySelector('.user-email');
  userEmail.textContent = popupInfo.user.email;

  const likes = document.querySelector('.like-count');
  likes.textContent = popupInfo.likes;
  const likeButton = document.querySelector('.like-button');
  likeButton.addEventListener('click', async e => {
    e.preventDefault();
    if (user.id !== undefined) {
      let newLink = portfolioLink + '?id=' + popupInfo.id + '&uid=' + user.id;
      let response = await fetch(newLink, {
        method: 'PATCH',
        headers: {
          'status': 'set-like'
        }
      })
      response = await response.json();
      likes.textContent = response.likes;
    }
  });
}

async function getInfoForPopup(itemID) {
  let newLink = portfolioLink + '?id=' + itemID;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info"
    },
  })
  return await response.json();
}

async function setPopupInfo(data, popup) {
  const popupHeader = popup.querySelector('.popup__title');
  const popupText = popup.querySelector('.popup__text');
  popupHeader.innerText = data['name'];
  popupText.innerText = data['description'];
}

async function popupLoadLogo(itemID) {
  let newLink = portfolioLink + '?id=' + itemID;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "status": "get-image"
    },
  })

  let responseHeaders = response.headers;
  let responseMethod = 'blob';
  responseHeaders.forEach(element => {
    if (element === 'json/application') {
      responseMethod = 'json';
    }
  });
  if (responseMethod === 'json') {
    return await response.json();
  }
  else {
    return await response.blob();
  }

}

async function popupLoadImages(itemID, index) {
  let newLink = portfolioLink + '?id=' + itemID + '&offset=' + index;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "status": "get-image-for-portfolio"
    },
  });
  return await response.blob();
}

function formattedImages(popupContent, popupItem) {
  let itemWidth = parseInt(getComputedStyle(popupItem).width);
  let containerWidth = parseInt(getComputedStyle(popupContent).width);
  if (itemWidth < containerWidth - 200) {
    popupItem.style.width = (containerWidth - 200) + 'px';
  }
  else {
    popupItem.style.width = (containerWidth + 1) + 'px';
  }
}

//pagination
