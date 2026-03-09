import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import Footer from "@/components/footer";
import { BLOG_POSTS } from "../data";
import type { Metadata } from "next";

export const generateMetadata = ({ params }: { params: { slug: string } }): Metadata => {
  const post = BLOG_POSTS.find((p: any) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Velamini Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} — Velamini Blog`,
      description: post.excerpt,
      url: `https://velamini.com/blog/${post.slug}`,
      siteName: "Velamini",
      images: [
        {
          url: "https://velamini.com/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      locale: "en_US",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Velamini Blog`,
      description: post.excerpt,
      images: ["https://velamini.com/velamini.png"],
    }
  };
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p: any) => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <>
      <div className="article-wrap">
        <Link href="/blog" className="article-back">
          <ArrowLeft size={16}/> Back to Blog
        </Link>
        <div className="article-header">
          <span className="article-cat" style={{ color: post.accentColor }}>{post.category}</span>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{post.date}</span>
            <span className="article-dot" />
            <Clock size={12}/>
            <span>{post.readTime}</span>
          </div>
          <div className="article-tags">
            {post.tags.map((tag: string) => (
              <span key={tag} className="article-tag"><Tag size={10}/> {tag}</span>
            ))}
          </div>
        </div>
        <div className="article-content">
          <p>{post.excerpt}</p>
          {/* Replace with full article content as needed */}
        </div>
      </div>
      <Footer />
    </>
  );
}
