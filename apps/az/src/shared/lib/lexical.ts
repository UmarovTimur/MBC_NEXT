type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
  url?: string;
  fields?: { url?: string; newTab?: boolean; linkType?: string };
  listType?: 'bullet' | 'number';
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeNode(node: LexicalNode): string {
  switch (node.type) {
    case 'root':
    case 'autolink':
      return node.children?.map(serializeNode).join('') ?? '';

    case 'paragraph': {
      const inner = node.children?.map(serializeNode).join('') ?? '';
      return inner ? `<p>${inner}</p>` : '<br />';
    }

    case 'heading': {
      const tag = node.tag ?? 'h2';
      return `<${tag}>${node.children?.map(serializeNode).join('') ?? ''}</${tag}>`;
    }

    case 'text': {
      let text = escapeHtml(node.text ?? '');
      const fmt = node.format ?? 0;
      if (fmt & 1) text = `<strong>${text}</strong>`;
      if (fmt & 2) text = `<em>${text}</em>`;
      if (fmt & 4) text = `<s>${text}</s>`;
      if (fmt & 8) text = `<u>${text}</u>`;
      if (fmt & 32) text = `<code>${text}</code>`;
      return text;
    }

    case 'link': {
      const href = escapeHtml(node.fields?.url ?? node.url ?? '');
      const newTab = node.fields?.newTab ?? false;
      const inner = node.children?.map(serializeNode).join('') ?? '';
      const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${target}>${inner}</a>`;
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      return `<${tag}>${node.children?.map(serializeNode).join('') ?? ''}</${tag}>`;
    }

    case 'listitem':
      return `<li>${node.children?.map(serializeNode).join('') ?? ''}</li>`;

    case 'quote':
      return `<blockquote>${node.children?.map(serializeNode).join('') ?? ''}</blockquote>`;

    case 'horizontalrule':
      return '<hr />';

    default:
      return node.children?.map(serializeNode).join('') ?? escapeHtml(node.text ?? '');
  }
}

export function lexicalToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  const root = (content as { root: LexicalNode }).root;
  if (!root) return '';
  return serializeNode(root);
}
