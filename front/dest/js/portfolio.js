const portfolioLink = 'http://artist-blog.ua/backend/arts';
let data;

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('page') || 1;
const ItemsInPage = 15;
const itemsCount = ItemsInPage * (myParam - 1);
const offset = itemsCount + ItemsInPage;


let pageCount;
let itemCount;


getCountPages(ItemsInPage);
window.onload = function () {
  let userField = document.getElementById('login');

  const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
  if (userToken !== 0) {
    getUser(link, userToken, userField);
    getImage(1);
  }
  else {
    userField.innerHTML = 'Увійти';
  }

}

function getCountPages(items) {
  let newLink = portfolioLink + '?itemsInPage=' + items;
  fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-count-pages",
    }
  })
    .then(res => res.json())
    .then(data => {
      pageCount = data['pages'];
      itemCount = data['items'];

      loadImages(itemsCount, offset);
    })
    .then(() => {
      addPopups();
    })
    .catch(exeption => {
      console.log(exeption);
    })
}

function loadImages(count, offset) {

  const portfolioItems = document.querySelector('.portfolio__items');
  portfolioItems.innerHTML = '';
  for (let i = count; i < offset; i++) {
    if (i >= itemCount) {
      console.log('break');
      break;
    }
    createElement(i, portfolioItems);
    addImage(i)
    addImageInfo(i);
  }
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

function addImageInfo(item) {
  let newLink = portfolioLink + '?item=' + item;
  fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info",
    }
  })
    .then(res => res.json())
    .then(data => {
      const imageItem = document.getElementById('desc' + (item + 1));
      const imageItemID = document.getElementById('itemID' + (item + 1));
      imageItem.innerText = data['name'];
      imageItemID.innerText = data['id'];
    });
}

function addImage(item) {
  let newLink = portfolioLink + '?item=' + item;
  fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-image"
    },
  }).then(response => {
    return response.blob()
  })
    .then(data => {
      let url = URL.createObjectURL(data);
      return url;
    })
    .then(image => {
      const imageItem = document.getElementById(item + 1);
      imageItem.src = image;
    })
    .catch(exeption => {
      console.log(exeption);
    });
}

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


function popupSetInforamation(popup, itemID) {
  let newLink = portfolioLink + '?id=' + itemID;
  fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info"
    },
  })
    .then(response => response.json())
    .then(data => {
      popup.innerHTML = `
        <div class="popup__body">
          <a href="##" class="popup__area"></a>
          <div class="popup__content">
            <a href="##" class="popup__close close-popup">x</a>
            <div class="popup__title"></div>
            <img class="popup__image" src="" alt="main-img">
            <div class="popup__text"></div>
          </div>
        </div>
        `;
      return data;
    }).then(data => {
      setPopupInfo(data, popup);
      return data;

    })
    .then(data => {
      popupLoadLogo(popup, newLink);
      return data;
    })
    .then(data => {
      popupLoadImages(popup, newLink, data['countImages']);
    })
    .catch(exeption => console.log(exeption));
}

function setPopupInfo(data, popup) {
  const popupHeader = popup.querySelector('.popup__title');
  const popupText = popup.querySelector('.popup__text');
  popupHeader.innerText = data['name'];
  popupText.innerText = data['description'];
}

async function popupLoadLogo(popup, link) {
  await fetch(link, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-image"
    },
  }).then(response => {
    return response.blob();
  })
    .then(data => {
      // console.log(data, 'data');
      let url = URL.createObjectURL(data);
      return url;
    })
    .then(image => {
      let popupContent = document.querySelector('.popup__content');
      const popupImage = document.querySelector('.popup__image');
      popupImage.src = image;
      popupImage.onload = () => {
        console.log(popupContent);
        formattedImages(popupContent, popupImage, 'logo ');
      }

    })
    .catch(exeption => {
      console.log(exeption);
    });
}

async function popupLoadImages(popup, link, imageCount) {

  for (let index = 0; index < imageCount; index++) {
    let newLink = link + '&offset=' + index;
    await fetch(newLink, {
      method: 'GET',
      headers: {
        "Content-type": "application/json;",
        "status": "get-image-for-portfolio"
      },
    }).then(response => {
      return response.blob()
    })
      .then(data => {
        let url = URL.createObjectURL(data);
        return url;
      })
      .then(image => {
        const popupContent = document.querySelector('.popup__content');
        popupContent.innerHTML += `<img class="popup__image" id="image${index + 1}" src="" alt="main-img">`;
        let popupImageItem = document.getElementById('image' + (index + 1));
        popupImageItem.src = image;
        popupImageItem.onload = () => {
          formattedImages(popupContent, popupImageItem, 'images');
        }
      })
      .catch(exeption => {
        console.log(exeption);
      });
  }
}

async function formattedImages(popupContent, popupItem, from) {
  let itemWidth = parseInt(getComputedStyle(popupItem).width);
  let containerWidth = parseInt(getComputedStyle(popupContent).width);

  if (isNaN(itemWidth)) {
    itemWidth = containerWidth + 100;
  }
  if (itemWidth < containerWidth - 200) {
    popupItem.style.width = (containerWidth - 200) + 'px';
  }
  else {
    popupItem.style.width = containerWidth + 'px';
  }

}

//pagination

const prevPageButton = document.getElementById('prev');
const nextPageButton = document.getElementById('next');

prevPageButton.addEventListener('click', () => {

});

nextPageButton.addEventListener('click', () => {
  let currentLocation = window.location.search.replace('?', '').split('&');
  let params = [];
  currentLocation.forEach(param => {
    let item = param.split('=');
    params[item[0]] = item[1];
  });
  params['page']++;
  let clearLocation = location.protocol + '//' + location.host + location.pathname;
  let link = clearLocation += '?page' + (params['page']);
  window.location.href = link;

});
