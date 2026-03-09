import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { ArrowRight, Clock } from "lucide-react";
import { BLOG_POSTS, CATEGORIES } from "./data";

export const metadata: Metadata = {
  title: "Blog — Velamini | AI Agents for African Businesses",
  description: "Tutorials, product updates and insights for businesses using AI in Africa.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Velamini Blog",
    description: "Tutorials, product updates and insights for businesses using AI in Africa.",
    url: "/blog",
    type: "website",
  },
};

type BlogPost = (typeof BLOG_POSTS)[number];

function FeaturedCard({ post }: { post: BlogPost }) {
  const Icon = post.icon;

  return (
    <Link href={`/blog/${post.slug}`} className="blog-featured">
      <div className="blog-featured-icon" style={{ color: post.accentColor }}>
        <Icon size={18} />
      </div>
      <div className="blog-featured-content">
        <div className="blog-meta-row">
          <span className="blog-pill" style={{ borderColor: `${post.accentColor}55`, color: post.accentColor }}>
            {post.category}
          </span>
          <span className="blog-meta-sep">•</span>
          <span className="blog-read"><Clock size={12} /> {post.readTime}</span>
        </div>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <span className="blog-read-more">
          Read article <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const Icon = post.icon;

  return (
    <Link href={`/blog/${post.slug}`} className="blog-card">
      <div className="blog-card-head">
        <span className="blog-pill" style={{ borderColor: `${post.accentColor}55`, color: post.accentColor }}>
          {post.category}
        </span>
        <span className="blog-read"><Clock size={12} /> {post.readTime}</span>
      </div>
      <div className="blog-card-title-row">
        <Icon size={16} style={{ color: post.accentColor }} />
        <h3>{post.title}</h3>
      </div>
      <p>{post.excerpt}</p>
      <span className="blog-read-more">
        Read article <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function BlogPage() {
  const featured = BLOG_POSTS.find((post) => post.featured);
  const rest = BLOG_POSTS.filter((post) => !post.featured);

  return (
    <>
      <style>{`
        .blog-wrap {
          min-height: 100dvh;
          padding-top: 3.75rem;
          background: #060e18;
          color: #d4eeff;
        }
        [data-mode="light"] .blog-wrap {
          background: #e8f4fd;
          color: #091828;
        }
        .blog-main {
          max-width: 1120px;
          margin: 0 auto;
          padding: 3.5rem 1.25rem 5rem;
        }
        .blog-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          margin: 0 0 0.75rem;
          line-height: 1.1;
        }
        .blog-hero p {
          margin: 0;
          color: #8bbad6;
          max-width: 720px;
          line-height: 1.7;
        }
        [data-mode="light"] .blog-hero p { color: #527a96; }
        .blog-cats {
          margin: 1.5rem 0 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .blog-cat {
          border: 1px solid #1a3448;
          background: #0d1e2e;
          color: #8bbad6;
          border-radius: 999px;
          padding: 0.32rem 0.8rem;
          font-size: 0.72rem;
        }
        [data-mode="light"] .blog-cat {
          border-color: #bdd9f0;
          background: #f4faff;
          color: #1c3a52;
        }
        .blog-featured {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1rem;
          text-decoration: none;
          color: inherit;
          border: 1px solid #1a3448;
          background: #0d1e2e;
          border-radius: 16px;
          padding: 1.1rem;
          margin-bottom: 1rem;
        }
        [data-mode="light"] .blog-featured {
          border-color: #bdd9f0;
          background: #fff;
        }
        .blog-featured-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(56, 174, 204, 0.1);
        }
        .blog-featured-content h2 {
          margin: 0.35rem 0;
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
        }
        .blog-featured-content p {
          margin: 0;
          color: #8bbad6;
          line-height: 1.65;
        }
        [data-mode="light"] .blog-featured-content p { color: #527a96; }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        .blog-card {
          text-decoration: none;
          color: inherit;
          border: 1px solid #1a3448;
          background: #0d1e2e;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        [data-mode="light"] .blog-card {
          border-color: #bdd9f0;
          background: #fff;
        }
        .blog-card-head,
        .blog-meta-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }
        .blog-pill {
          border: 1px solid;
          border-radius: 999px;
          padding: 0.2rem 0.55rem;
          font-size: 0.66rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .blog-read {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #5b8fa8;
          font-size: 0.73rem;
        }
        [data-mode="light"] .blog-read { color: #527a96; }
        .blog-meta-sep { color: #2e5470; }
        .blog-card-title-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .blog-card h3 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.35;
        }
        .blog-card p {
          margin: 0;
          color: #8bbad6;
          line-height: 1.6;
          font-size: 0.9rem;
        }
        [data-mode="light"] .blog-card p { color: #527a96; }
        .blog-read-more {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #38aecc;
          font-size: 0.8rem;
          font-weight: 700;
        }
      `}</style>

      <div className="blog-wrap">
        <Navbar />
        <main className="blog-main">
          <section className="blog-hero">
            <h1>Velamini Blog</h1>
            <p>Tutorials, product updates and practical guides for using AI agents in African businesses.</p>
          </section>

          <div className="blog-cats">
            {CATEGORIES.map((category) => (
              <span key={category} className="blog-cat">
                {category}
              </span>
            ))}
          </div>

          {featured && <FeaturedCard post={featured} />}

          <section className="blog-grid">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
