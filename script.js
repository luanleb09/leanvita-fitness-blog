const SHEET_ID = '1m9Fy1dbFL2q3RimNacf8VnqA5CYFGnRv2lul60yHxbQ' // thay bằng của bạn
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`

async function fetchPosts() {
  const res = await fetch(SHEET_URL)
  const text = await res.text()
  const json = JSON.parse(text.substring(47).slice(0, -2)) // bỏ phần wrapper Google
  const rows = json.table.rows

  return rows.map(row => {
    return {
      id: row.c[0]?.v || '',
      title: row.c[1]?.v || '',
      summary: row.c[2]?.v || '',
      image: row.c[3]?.v || '',
      contentUrl: row.c[4]?.v || '',
      tag: row.c[5]?.v || '',
    }
  })
}
document.addEventListener('DOMContentLoaded', async () => {
  const posts = await fetchPosts()
  const postsContainer = document.getElementById('posts')
  const tagList = document.getElementById('tag-list')

  // Lọc danh sách tag duy nhất
  const uniqueTags = [...new Set(posts.map(p => p.tag).filter(Boolean))]
  uniqueTags.forEach(tag => {
    const li = document.createElement('li')
    li.textContent = tag
    tagList.appendChild(li)
  })

  // Render bài viết
  posts.forEach(post => {
    const card = document.createElement('div')
    card.style.border = '1px solid #ccc'
    card.style.padding = '1rem'
    card.style.borderRadius = '8px'
    card.style.background = '#fff'
    card.style.cursor = 'pointer'

    card.innerHTML = `
      <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;" />
      <h4 style="margin-top: 0.5rem">${post.title}</h4>
      <p>${post.summary}</p>
    `

    // Click để mở bài viết
    card.addEventListener('click', () => {
      window.location.href = post.contentUrl
    })

    postsContainer.appendChild(card)
  })
})