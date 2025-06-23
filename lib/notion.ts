import { Client, collectPaginatedAPI } from '@notionhq/client'
import {
  BlockObjectResponse,
  PartialBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID || ''

// Lấy toàn bộ database đã published
export async function getDatabase() {
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

  return response.results
}

// Dùng để lấy các bài viết, thường dùng ở trang chủ
export async function getBlogPosts() {
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

// Lấy 1 bài viết từ slug
export async function getPostBySlug(slug: string) {
  const database = await getDatabase()
  return database.find(
    (page: any) => page.properties?.Slug?.rich_text?.[0]?.plain_text === slug
  )
}

// Lấy toàn bộ blocks của 1 bài viết
export async function getPageBlocks(pageId: string) {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  }).then((res) => res.results)

  for (const block of blocks) {
    // Chỉ fetch children nếu block là BlockObjectResponse và có has_children
    if ('has_children' in block && block.has_children) {
      const childBlocks = await getPageBlocks(block.id)
      ;(block as BlockObjectResponse & { children?: any[] }).children = childBlocks
    }
  }

  return blocks
}