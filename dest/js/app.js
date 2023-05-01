import { QUERY_LINK } from "./backlink.js";
setTimeout(() => {
  let burger = document.querySelector('.header__burger');
  let menu = document.querySelector('.menu__nav');
  let body = document.querySelector('body');
  let searchBar = document.querySelector('.menu__search-bar');
  burger.addEventListener('click', (e) => {
    e.preventDefault();
    burger.classList.toggle('active');
    menu.classList.toggle('active');
    body.classList.toggle('lock');
    searchBar.classList.toggle('active');
  });
  let searchButton = document.querySelector('.menu__search-submit');
  searchButton.addEventListener('click', e => {
    e.preventDefault();
    const searchField = document.querySelector('.menu__search-input');
    if (searchField.value.length > 0) {
      window.location.href = QUERY_LINK + 'search/?q=' + searchField.value;
    }
  });
}, 1000);





