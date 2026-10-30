import type { MDXComponents } from "mdx/types";

// Guide and legal pages are styled by the `.prose-sea` wrapper; links to
// other sites open normally and carry rel="noopener".
const components: MDXComponents = {
  a: ({ href, children, ...props }) => {
    const external = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a href={href} rel={external ? "noopener" : undefined} {...props}>
        {children}
      </a>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
