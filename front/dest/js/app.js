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
}, 1000);




