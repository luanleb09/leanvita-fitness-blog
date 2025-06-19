import { GetStaticProps } from 'next';
import Head from 'next/head';
import { siteConfig } from '../lib/config';
import { getBlogPosts } from '../lib/notion';

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getBlogPosts(siteConfig.notionPageId);
  return {
    props: { posts },
    revalidate: 60
  };
};

export default function Home({ posts }) {
  return (
    <div>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
      </Head>
      <main style={{ maxWidth: 720, margin: 'auto', padding: 16 }}>
        <h1>{siteConfig.name}</h1>
        <p>{siteConfig.description}</p>
        {posts.length === 0 ? (
          <p>No posts yet. Add one in Notion.</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id} style={{ margin: '16px 0' }}>
                <a href={`/posts/${post.slug}`}><strong>{post.title}</strong></a>
                <p>{post.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}