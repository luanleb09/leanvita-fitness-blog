
const SHEET_ID = 'YOUR_SHEET_ID';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/posts`;

fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    const postsContainer = document.getElementById('posts');
    const menu = document.getElementById('menu');
    const tags = new Set();
    data.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = `
        <a href="post.html?id=${post.id}">
          <img src="${post.thumbnail}" alt="" width="100%">
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
        </a>
      `;
      postsContainer.appendChild(card);
      tags.add(post.tag);
    });
    tags.forEach(tag => {
      const item = document.createElement('div');
      item.textContent = tag;
      menu.appendChild(item);
    });
  });
