
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
 async function fetchAndRenderPost() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('slug')

  if (!slug) {
    document.getElementById('post-content').innerText = 'Không tìm thấy slug!'
    return
  }

  const posts = await fetchPosts()
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    document.getElementById('post-content').innerText = 'Không tìm thấy bài viết!'
    return
  }

  // Cập nhật tiêu đề
  document.getElementById('post-title').innerText = post.title

  // Gọi nội dung từ Google Docs (HTML)
  const docUrl = post.content
  const htmlUrl = docUrl.replace('/edit', '/export?format=html')

  try {
    const res = await fetch(htmlUrl)
    const html = await res.text()
    document.getElementById('post-content').innerHTML = html
  } catch (err) {
    document.getElementById('post-content').innerText = 'Lỗi tải nội dung.'
    console.error(err)
  }
}

if (window.location.pathname.includes('post.html')) {
  fetchAndRenderPost()
}
