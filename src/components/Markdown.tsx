import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

// Constantes de módulo: los plugins no cambian entre renders.
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeHighlight];

/**
 * Markdown del enunciado, pistas y tutorial. Se usa solo en componentes de
 * servidor, así react-markdown y highlight.js no viajan al navegador.
 */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`prose-panda ${className}`}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
