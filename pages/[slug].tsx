import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getDatabase, getPostBySlug, getPageBlocks } from '@/lib/notion'

export const getStaticPaths: GetStaticPaths = async () => {
  const database = await getDatabase()

  const paths = database
    .map((page: any) => {
      const slug = page.properties?.Slug?.rich_text?.[0]?.plain_text
      if (!slug) return null
      return { params: { slug } }
    })
    .filter(Boolean) as { params: { slug: string } }[]

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
  const title = post.properties?.Title?.title?.[0]?.plain_text || 'Untitled'

  return (
    <div className="container mx-auto px-4 py-8">
      <Head><title>{title}</title></Head>
      <h1 className="text-4xl font-bold mb-6">{title}</h1>

      <div className="prose max-w-none">
        {blocks.map((block: any) => {
          const text = block[block.type]?.text

          switch (block.type) {
            case 'heading_1':
              return <h1 key={block.id}>{text?.[0]?.plain_text ?? ''}</h1>

            case 'heading_2':
              return <h2 key={block.id}>{text?.[0]?.plain_text ?? ''}</h2>

            case 'heading_3':
              return <h3 key={block.id}>{text?.[0]?.plain_text ?? ''}</h3>

            case 'paragraph':
              return (
                <p key={block.id}>
                  {text?.map((t: any, i: number) => <span key={i}>{t.plain_text}</span>)}
                </p>
              )

            case 'bulleted_list_item':
            case 'numbered_list_item':
              const listItem = block[block.type]?.text?.[0]?.plain_text ?? ''
              return <li key={block.id}>{listItem}</li>

            case 'quote':
              return <blockquote key={block.id}>{text?.[0]?.plain_text ?? ''}</blockquote>

            case 'code':
              return (
                <pre key={block.id} className="bg-gray-100 p-2 rounded overflow-auto">
                  <code>{block.code?.text?.[0]?.plain_text ?? ''}</code>
                </pre>
              )

            case 'toggle':
              return (
                <details key={block.id}>
                  <summary>{block.toggle?.text?.[0]?.plain_text ?? ''}</summary>
                </details>
              )

            case 'image':
              const src = block.image?.file?.url || block.image?.external?.url
              return src ? <img key={block.id} src={src} alt="image" className="my-4" /> : null

            case 'table':
              return (
                <table key={block.id} className="table-auto border-collapse border border-gray-300 my-4">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">🔹 Table block not fully supported yet</td>
                    </tr>
                  </tbody>
                </table>
              )

            default:
              return <p key={block.id}>🔹 Unsupported block: {block.type}</p>
          }
        })}
      </div>
    </div>
  )
}
