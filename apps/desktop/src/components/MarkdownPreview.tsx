import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { openExternal } from "../utils/openExternal";

interface Props {
  content: string;
  className?: string;
  /**
   * Resolve relative URLs (links + images) against this base.
   * Typical value: `https://github.com/{owner}/{repo}/blob/{branch}/`.
   * Without it, relative refs like `README_zh.md` go nowhere in the Tauri webview.
   */
  baseUrl?: string;
}

function resolveHref(href: string | undefined, baseUrl?: string): string | undefined {
  if (!href || !baseUrl) return href;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

export default function MarkdownPreview({ content, className = "", baseUrl }: Props) {
  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          a: ({ href, children, ...rest }) => {
            const resolved = resolveHref(href, baseUrl);
            return (
              <a
                href={resolved}
                onClick={(e) => {
                  if (resolved && /^https?:\/\//.test(resolved)) {
                    e.preventDefault();
                    void openExternal(resolved);
                  }
                }}
                {...rest}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...rest }) => {
            const resolved = resolveHref(src, baseUrl);
            return <img src={resolved} alt={alt} {...rest} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
