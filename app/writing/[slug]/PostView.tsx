'use client'

import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Post } from "@/lib/posts"
import BackLink from "../BackLink"

export default function PostView({ post }: { post: Post }) {
    return (
        <main className="research-page">
            <article className="research-article">

                <BackLink fallbackHref="/writing">&larr; back to writing</BackLink>

                <header className="rp-header">
                    <p className="rp-date">
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <h1 className="rp-title">{post.title}</h1>
                    {post.excerpt ? <p className="rp-byline">{post.excerpt}</p> : null}
                </header>

                {post.coverImage ? (
                    <div className="rp-cover-wrap">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            width={1200}
                            height={630}
                            className="rp-cover-img"
                            priority
                        />
                    </div>
                ) : null}

                <hr className="rp-rule" />

                <div className={`rp-post-body${post.dropcap === false ? ' no-dropcap' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>

                <hr className="rp-rule" />

                <footer className="rp-footer">
                    <p>
                        <Link href="/writing" className="rp-arrow-link">&larr; back to writing</Link>
                        {" "}&middot;{" "}
                        <Link href="/" className="rp-arrow-link">home</Link>
                    </p>
                </footer>

            </article>
        </main>
    )
}
