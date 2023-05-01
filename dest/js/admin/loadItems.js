import { QUERY_LINK } from '../backlink.js';
import getTemplate from './templates.js';
const loadLink = QUERY_LINK + 'admin/';

let limitCount;
let offsetCount;
let access;
async function loadItems(pageName, limit, offset, userAccess) {
  limitCount = limit;
  offsetCount = offset;
  access = offset;
  access = userAccess;
  let link = loadLink + pageName + '?userAccess=' + userAccess;

  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'limit': limit,
      'offset': offset,
    }
  });
  let items = await response.json();
  await outItems(items, pageName, offset, userAccess);

}

async function refresh(pageName) {
  loadItems(pageName, limitCount, offsetCount, access);
}

async function outItems(items, pageName, offset, userAccess) {
  let template = await getTemplate(pageName, items[pageName], offset, userAccess);
  let content = document.querySelector('.content__items');
  content.innerHTML = '';
  content.appendChild(template);

  let { default: addItemsHandler } = await import('./' + pageName + '.js');
  await addItemsHandler(template, userAccess);
}

export { loadItems, refresh };
