// script.js (nâng cấp hoàn chỉnh với slug URL)
const SHEET_ID = '1m9Fy1dbFL2q3RimNacf8VnqA5CYFGnRv2lul60yHxbQ'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
const CACHE_KEY = 'blog_posts_cache'
const CACHE_TIME = 1000 * 60 * 10 // 10 phút

async function fetchPosts(force = false) {
  const cached = localStorage.getItem(CACHE_KEY)
  const cachedTime = localStorage.getItem(CACHE_KEY + '_time')
  const now = Date.now()

  if (cached && cachedTime && now - cachedTime < CACHE_TIME && !force) {
    return JSON.parse(cached)
  }

  const res = await fetch(SHEET_URL)
  const text = await res.text()
  const json = JSON.parse(text.substring(47).slice(0, -2))
  const rows = json.table.rows

  const posts = rows.map(row => ({
	  id: row.c[0]?.v || '',
	  title: row.c[1]?.v || '',
	  slug: row.c[2]?.v || '', // cập nhật đúng slug
	  image: row.c[3]?.v || '',
	  content: row.c[4]?.v || '',
	  date: row.c[5]?.v || '',
	  tag: row.c[6]?.v || '',
	}))

  localStorage.setItem(CACHE_KEY, JSON.stringify(posts))
  localStorage.setItem(CACHE_KEY + '_time', now)
  return posts
}

function renderTags(posts) {
  const tagList = document.getElementById('tag-list')
  const uniqueTags = [...new Set(posts.map(p => p.tag).filter(Boolean))]

  tagList.innerHTML = ''
  uniqueTags.forEach(tag => {
    const li = document.createElement('li')
    li.textContent = tag
    li.style.cursor = 'pointer'
    li.onclick = () => renderPosts(posts.filter(p => p.tag === tag))
    tagList.appendChild(li)
  })
}

function renderPosts(posts) {
  const postsContainer = document.getElementById('posts')
  postsContainer.innerHTML = ''

  posts.forEach(post => {
    const card = document.createElement('div')
    card.className = 'post-card'
    card.innerHTML = `
      <img src="${post.image}" alt="${post.title}" />
      <h4>${post.title}</h4>
      <p>${post.summary}</p>
    `
    card.onclick = () => {
      window.location.href = `post.html?slug=${encodeURIComponent(post.slug)}`
    }
    postsContainer.appendChild(card)
  })
}

function setupSearch(posts) {
  const input = document.getElementById('search-input')
  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase()
    const filtered = posts.filter(post => post.title.toLowerCase().includes(keyword) || post.summary.toLowerCase().includes(keyword))
    renderPosts(filtered)
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  const posts = await fetchPosts()
  renderTags(posts)
  renderPosts(posts)
  setupSearch(posts)
})
// Nếu đang ở trang post.html thì hiển thị nội dung chi tiết
if (window.location.pathname.includes('post.html')) {
  (async () => {
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

    document.getElementById('post-title').innerText = post.title

    // Load nội dung từ Google Docs ở dạng HTML
    const docUrl = post.content
    const htmlUrl = docUrl.replace('/edit', '/export?format=html')

    try {
      const res = await fetch(htmlUrl)
      const html = await res.text()
      document.getElementById('post-content').innerHTML = html
    } catch (err) {
      document.getElementById('post-content').innerText = 'Lỗi khi tải nội dung bài viết.'
      console.error(err)
    }
  })()
}
