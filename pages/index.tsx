import { GetStaticProps } from 'next';
import Head from 'next/head';
import { siteConfig } from '../lib/config';
import { getBlogPosts } from '../lib/notion';
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { getBlogPosts } from '@/lib/notion'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getBlogPosts()
  return { props: { posts }, revalidate: 60 }
}


type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
};

interface HomeProps {
  posts: Post[];
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getBlogPosts();
  return {
    props: { posts },
    revalidate: 60
  };
};

export default function Home({ posts }: HomeProps) {
  return (
    <div>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
      </Head>

      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>{siteConfig.name}</h1>
        <p style={{ fontSize: '1.2rem' }}>{siteConfig.description}</p>
      </section>

      {/* Call to Action */}
      <section style={{
        backgroundColor: '#f1f8e9',
        padding: '40px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #c8e6c9'
      }}>
        <h2 style={{ marginBottom: 12 }}>Start Your Fat Loss Journey Today</h2>
        <p style={{ marginBottom: 16 }}>Join our free newsletter to get weekly tips, product reviews, and exclusive offers.</p>
        <button style={{
          backgroundColor: '#66bb6a',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>Join Free</button>
      </section>

      {/* Blog posts */}
      <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
        <h2>Latest Articles</h2>
        {posts.length === 0 ? (
          <p>No posts yet. Add one in Notion.</p>
        ) : (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {posts.map((post) => (
              <li key={post.id} style={{ margin: '24px 0', borderBottom: '1px solid #ccc', paddingBottom: 16 }}>
                <a href={`/posts/${post.slug}`} style={{ fontSize: '1.25rem', color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none' }}>{post.title}</a>
                <p style={{ marginTop: 8 }}>{post.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
