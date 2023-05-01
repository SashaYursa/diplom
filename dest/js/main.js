import { QUERY_LINK } from "./backlink.js";
setTimeout(() => {
  outPage();
}, 100);

const mainLink = QUERY_LINK + 'main';
const portfolioLogoLink = QUERY_LINK + 'portfolio/logo/';

async function outPage() {
  let works = await getMostPopularWork(mainLink);
  console.log(works);
  let mostPopularWork = works.mostPopular;
  let popularWorks = works.popularWorks;
  const header = document.querySelector('.content__header');
  header.innerHTML = mostPopularWork.name;
  const desc = document.querySelector('.content__description');
  desc.innerHTML = mostPopularWork.description;
  let date = mostPopularWork.created_at.split(' ');
  date = date[0].replace(/-/g, '.');
  const dateContent = document.querySelector('.content__date');
  dateContent.innerHTML = date;
  const backgroundImage = document.querySelector('.background-image');
  backgroundImage.src = portfolioLogoLink + mostPopularWork.portfolio_logo;
  addPopularWorks(popularWorks);
}

function addPopularWorks(popularWorks) {
  const popularWorksContainer = document.querySelector('.works__container');
  popularWorksContainer.innerHTML = '<h2 class="topics__header text-header">Популярні роботи</h2>';
  let workTemplate = `
  <div class="topic__item">
    <img class="topic__image" src="" alt="img">
    <div class="topic__text">
      <a class="topic__link" href="#">
        <h3 class="topic__header"></h3>
      </a>
      <a class="topic__link desc-link" href="#">
        <p class="topic__description">
        </p>
      </a>
      <div class="topic__attributes">
        <p class="topic__date">10.02.2022</p>
        <div class="topic__likes">
          <img class="topic__like-img" src="dest/images/like.png" alt"like-img"/>
          <span class="topic__like-count">0</span>
        </div>
      </div>
    </div>
  </div>
  `;
  for (const item of popularWorks) {
    let workItem = document.createElement('div');
    workItem.classList.add('topics__topic');
    workItem.innerHTML += workTemplate;
    let workHeader = workItem.querySelector('.topic__header');
    workHeader.textContent = item.name;
    let workDesc = workItem.querySelector('.topic__description');
    workDesc.textContent = item.description;
    let workImage = workItem.querySelector('.topic__image');
    workImage.src = portfolioLogoLink + item.portfolio_logo;
    let date = item.created_at.split(' ');
    date = date[0].replace(/-/g, '.');
    let workDate = workItem.querySelector('.topic__date');
    workDate.textContent = date;
    let workLikes = workItem.querySelector('.topic__like-count');
    workLikes.textContent = item.likes;


    popularWorksContainer.appendChild(workItem);
  }

}

async function getMostPopularWork(link) {
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-most-popular',
      'Content-Security-Policy': 'upgrade-insecure-requests',
    }
  });
  response = await response.json();
  return response;
}
