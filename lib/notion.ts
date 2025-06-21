import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID || ''

// Lấy tất cả bài viết đã publish
export async function getDatabase() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  })

  return response.results
}

// Trả về bài viết dạng chuẩn hóa
export async function getBlogPosts(databaseId: string) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true
      }
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending'
      }
    ]
  })

  return response.results.map((page: any) => {
    const props = page.properties
    return {
      id: page.id,
      title: props.Title?.title?.[0]?.plain_text || 'Untitled',
      slug: props.Slug?.rich_text?.[0]?.plain_text || '',
      excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || '',
      date: props.Date?.date?.start || null
    }
  })
}

// Tìm bài viết theo slug (đã fix lỗi undefined)
export async function getPostBySlug(slug: string) {
  const database = await getDatabase()
  return database.find((page: any) => {
    const pageSlug = page.properties.Slug?.rich_text?.[0]?.plain_text
    return pageSlug === slug
  })
}

// Lấy các block nội dung chi tiết bài viết
export async function getPageBlocks(pageId: string) {
  const blocks = await notion.blocks.children.list({ block_id: pageId })
  return blocks.results
}
