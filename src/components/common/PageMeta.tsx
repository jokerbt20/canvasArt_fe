import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
}

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | CanvasArt`;
    document.title = fullTitle;
    setMetaTag("og:title", fullTitle, "property");
    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:description", description, "property");
    }
  }, [title, description]);

  return null;
}
