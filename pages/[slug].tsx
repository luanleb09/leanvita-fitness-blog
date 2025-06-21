import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getDatabase, getPostBySlug, getPageBlocks } from '@/lib/notion'

export const getStaticPaths: GetStaticPaths = async () => {
  const database = await getDatabase()
  const paths = database
    .filter((page: any) => page.properties.Published.checkbox)
    .map((page: any) => ({
      params: { slug: page.properties.Slug.rich_text[0]?.plain_text },
    }))
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  const post = await getPostBySlug(slug)

  if (!post) return { notFound: true }

  const blocks = await getPageBlocks(post.id)

  return {
    props: { post, blocks },
    revalidate: 60,
  }
}

export default function Post({ post, blocks }: any) {
  const title = post.properties.Title.title[0]?.plain_text

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{title}</title>
      </Head>

      <h1 className="text-4xl font-bold mb-6">{title}</h1>

      <div className="prose max-w-none">
        {blocks.map((block: any) => {
          switch (block.type) {
            case 'heading_1':
              return <h1 key={block.id}>{block.heading_1.text[0]?.plain_text}</h1>
            case 'heading_2':
              return <h2 key={block.id}>{block.heading_2.text[0]?.plain_text}</h2>
            case 'paragraph':
              return (
                <p key={block.id}>
                  {block.paragraph.text.map((t: any, i: number) => (
                    <span key={i}>{t.plain_text}</span>
                  ))}
                </p>
              )
            case 'bulleted_list_item':
              return <li key={block.id}>{block.bulleted_list_item.text[0]?.plain_text}</li>
            default:
              return <p key={block.id}>🔹 Unsupported block: {block.type}</p>
          }
        })}
      </div>
    </div>
  )
}