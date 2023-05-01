import { QUERY_LINK, DAYS, MONTHS, DEFAULT_IMAGE } from "./backlink.js";
const link = QUERY_LINK + 'articles';
const articlesContainer = document.querySelector('.articles__items');


async function getArticles(offset, limit) {
  const newLink = link + '?offset=' + offset + '&limit=' + limit;
  const response = await fetch(newLink, {
    method: 'GET',
  });
  if (response !== '') {
    return response.json();
  }
  return false;
}

function outArticles(articles) {

  const articleTemplate = `
  <div class="article__image">
    <img class="article-img" src="../dest/images/example-pict.webp" alt="pict">
  </div>
  <div class="article__content">
    <div class="article__author">
      <div class="article__author-image">
        <img class="author-img" src="../dest/images/example-pict.webp" alt="author">
      </div>
      <div class="article__author-content">
        <h3 class="article__author-name"></h3>
        <div class="article__date">
          <p class="article__date-published"></p>
        </div>
      </div>
    </div>
    <a class="article__description">
      <h2 class="article__description-header">
      </h2>
      <p class="article__description-content">
      </p>
    </a>
    <div class="article__stats">
      <a class="article__coment-link" href="#">
        <p class="article__stats-comments"></p>
      </a>
      <a class="article__stats-like-field">
        <p class="article__stats-likes">30</p>
        <button class="article__like-button">
          <img src="../dest/images/like.png" alt="like">
        </button>
      </a>
    </div>
  </div>
`;
  if (!articles) {
    const header = articlesContainer.querySelector('.articles__header');
    articlesContainer.innerHTML = '';
    articlesContainer.append(header);
    header.innerHTML = 'Статей не знайдено';
    return false;
  }
  let articlesList = articlesContainer.querySelector('.articles__list');
  articlesList.innerHTML = '';
  for (const i in articles) {
    let article = articles[i];
    console.log(article);
    let articleItem = document.createElement('div');
    articleItem.classList.add('articles__item');
    articleItem.innerHTML = articleTemplate;
    let articleImg = articleItem.querySelector('.article-img');
    article.logo === 'empty'
      ? articleImg.src = '..' + DEFAULT_IMAGE
      : articleImg.src = QUERY_LINK + article.logo;
    let articleDescriptionHeader = articleItem.querySelector('.article__description-header');
    article.name.length > 49
      ? articleDescriptionHeader.textContent = article.name.slice(0, 49) + '...'
      : articleDescriptionHeader.textContent = article.name;

    let articleDescriptionContent = articleItem.querySelector('.article__description-content');
    article.description.length > 350
      ? articleDescriptionContent.textContent = article.description.slice(0, 350) + '...'
      : articleDescriptionContent.textContent = article.description;
    let authorImg = articleItem.querySelector('.author-img');
    article.user_image === 'empty'
      ? authorImg.src = '..' + DEFAULT_IMAGE
      : authorImg.src = QUERY_LINK + article.user_image;
    let articleAuthorName = articleItem.querySelector('.article__author-name');
    article.login.length > 40
      ? articleAuthorName.textContent = article.login.slice(0, 40) + '...'
      : articleAuthorName.textContent = article.login;
    let articleDatePublished = articleItem.querySelector('.article__date-published');
    setDate(article.created_at, articleDatePublished);

    let articleStatsComments = articleItem.querySelector('.article__stats-comments');
    articleStatsComments.textContent = 'Коментарів: ' + article.coments_count;
    let articleStatsLikes = articleItem.querySelector('.article__stats-likes');
    articleStatsLikes.textContent = article.likes_count;
    articlesList.appendChild(articleItem);

    let articleLink = articleItem.querySelector('.article__description');

    articleLink.href = '../article?id=' + article.id;
  }
}

function setDate(timestamp, field) {
  const date = new Date(timestamp);
  const dateNow = new Date();
  console.log(dateNow.getDate() - 1);
  if (date.getDate() == dateNow.getDate() && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    console.log('todey');
    field.textContent = 'Додано: сьогодні ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else if (date.getDate() === dateNow.getDate() - 1 && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    console.log('yesterday');
    field.textContent = 'Додано: вчора ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else {
    field.textContent = 'Додано: ' + DAYS[date.getDay()].slice(0, 3) + '. ' + date.getDay() + ' ' + MONTHS[date.getMonth()].slice(0, 3) + '. ' + date.getFullYear();
  }

  console.log(date.getDay());
  //articleDatePublished.textContent = MONTHS[date.getMonth()] + ' ' + DAYS[date.getDay()];
}

async function main() {
  const articles = await getArticles(0, 15);
  console.log(articles);
  const outResult = outArticles(articles.response);

}
main();

