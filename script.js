// Constants
const SHEET_ID = '1m9Fy1dbFL2q3RimNacf8VnqA5CYFGnRv2lul60yHxbQ'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
const CACHE_KEY = 'blog_posts_cache'
const CACHE_TIME = 1000 * 60 * 10

// Fetch and cache
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
    slug: row.c[2]?.v || '',
    image: row.c[3]?.v || '',
    content: row.c[4]?.v || '',
    date: row.c[5]?.v || '',
    tag: row.c[6]?.v || '',
  }))

  localStorage.setItem(CACHE_KEY, JSON.stringify(posts))
  localStorage.setItem(CACHE_KEY + '_time', now)
  return posts
}

// Render
function renderTags(posts) {
  const tagList = document.getElementById('tag-list')
  if (!tagList) return
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
  const container = document.getElementById('posts')
  const postPage = document.getElementById('post-page')
  if (!container) return
  container.innerHTML = ''
  container.style.display = 'block'
  postPage.style.display = 'none'

  posts.forEach(post => {
    const card = document.createElement('div')
    card.className = 'post-card'
    card.innerHTML = `
      <img src="${post.image}" alt="${post.title}" />
      <h4>${post.title}</h4>
      <p>${post.date}</p>
    `
    card.onclick = () => {
      window.history.pushState({}, '', `?slug=${post.slug}`)
      renderSinglePost(post)
    }
    container.appendChild(card)
  })
}

async function renderSinglePost(post) {
  const postsContainer = document.getElementById('posts')
  const postPage = document.getElementById('post-page')
  const titleEl = document.getElementById('post-title')
  const contentEl = document.getElementById('post-content')

  postsContainer.style.display = 'none'
  postPage.style.display = 'block'
  titleEl.textContent = post.title

  try {
    const docHtmlUrl = post.content.replace('/edit', '/export?format=html')
    const res = await fetch(docHtmlUrl)
    const html = await res.text()
    contentEl.innerHTML = html
  } catch (err) {
    contentEl.innerText = 'Không thể tải nội dung bài viết.'
  }
}

function setupSearch(posts) {
  const input = document.getElementById('search-input')
  if (!input) return
  input.addEventListener('input', () => {
    const kw = input.value.toLowerCase()
    const filtered = posts.filter(p => p.title.toLowerCase().includes(kw))
    renderPosts(filtered)
  })
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const posts = await fetchPosts()
  renderTags(posts)
  setupSearch(posts)

  const params = new URLSearchParams(window.location.search)
  const slug = params.get('slug')
  if (slug) {
    const post = posts.find(p => p.slug === slug)
    if (post) renderSinglePost(post)
  } else {
    renderPosts(posts)
  }
})
