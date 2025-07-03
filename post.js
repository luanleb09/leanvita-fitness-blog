
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');
const SHEET_ID = 'YOUR_SHEET_ID';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/posts`;

fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    const post = data.find(p => p.id === postId);
    if (post) {
      const container = document.getElementById('post-content');
      container.innerHTML = `
        <h1>${post.title}</h1>
        <iframe src="${post.doc_url}" width="100%" height="600px"></iframe>
      `;
    }
  });
 
