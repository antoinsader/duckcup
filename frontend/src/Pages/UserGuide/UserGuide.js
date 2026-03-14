import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ExtraSideBar from "../../components/layout_shell/ExtraSideBar";

import styles from "./UserGuide.module.scss";

const GUIDE_FETCH_PATH = "/user_guide.md";

const normalize_text = (value) => {
  return String(value || "").trim();
};

const slugify_title = (title_value = "") => {
  return normalize_text(title_value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const build_section_id = (title_value = "", section_index = 0) => {
  const title_slug = slugify_title(title_value);
  if (title_slug) return title_slug;
  return `section-${section_index + 1}`;
};

const normalize_image_src = (src_value = "") => {
  const normalized_src = String(src_value || "").trim();
  if (!normalized_src) return "";

  if (/^(https?:)?\/\//.test(normalized_src) || normalized_src.startsWith("data:")) {
    return normalized_src;
  }

  return normalized_src.startsWith("/") ? normalized_src : `/${normalized_src.replace(/^\.\//, "")}`;
};

const parse_guide_markdown = (markdown_text = "") => {
  const source_lines = String(markdown_text || "").split(/\r?\n/);
  const sections = [];

  let page_title = "User Guide";
  let current_section = null;

  source_lines.forEach((line_value) => {
    const line = String(line_value || "");

    if (line.startsWith("# ")) {
      const heading_text = normalize_text(line.slice(2));
      if (heading_text) page_title = heading_text;
      return;
    }

    if (line.startsWith("## ")) {
      const title_text = normalize_text(line.slice(3)) || `Section ${sections.length + 1}`;
      const section_id = build_section_id(title_text, sections.length);

      current_section = {
        id: section_id,
        title: title_text,
        lines: [],
      };

      sections.push(current_section);
      return;
    }

    if (!current_section) {
      const fallback_section = {
        id: "overview",
        title: "Overview",
        lines: [],
      };

      sections.push(fallback_section);
      current_section = fallback_section;
    }

    current_section.lines.push(line);
  });

  return {
    page_title,
    sections,
  };
};

const render_section_content = (section_lines = []) => {
  const content_blocks = [];
  let paragraph_lines = [];
  let list_items = [];
  let list_type = null;

  const flush_paragraph = () => {
    if (!paragraph_lines.length) return;
    content_blocks.push({
      type: "paragraph",
      text: paragraph_lines.join(" ").trim(),
    });
    paragraph_lines = [];
  };

  const flush_list = () => {
    if (!list_items.length) return;
    content_blocks.push({
      type: "list",
      list_type: list_type || "unordered",
      items: [...list_items],
    });
    list_items = [];
    list_type = null;
  };

  section_lines.forEach((line_value) => {
    const line = String(line_value || "");
    const trimmed_line = line.trim();

    if (!trimmed_line) {
      flush_paragraph();
      flush_list();
      return;
    }

    if (trimmed_line.startsWith("### ")) {
      flush_paragraph();
      flush_list();
      content_blocks.push({
        type: "h3",
        text: trimmed_line.slice(4).trim(),
      });
      return;
    }

    const image_match = trimmed_line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/);
    if (image_match) {
      flush_paragraph();
      flush_list();
      content_blocks.push({
        type: "image",
        alt: (image_match[1] || "Guide image").trim(),
        src: normalize_image_src(image_match[2] || ""),
        title: (image_match[3] || "").trim(),
      });
      return;
    }

    if (/^[-*]\s+/.test(trimmed_line)) {
      flush_paragraph();
      if (list_type && list_type !== "unordered") {
        flush_list();
      }
      list_type = "unordered";
      list_items.push(trimmed_line.replace(/^[-*]\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed_line)) {
      flush_paragraph();
      if (list_type && list_type !== "ordered") {
        flush_list();
      }
      list_type = "ordered";
      list_items.push(trimmed_line.replace(/^\d+\.\s+/, ""));
      return;
    }

    flush_list();
    paragraph_lines.push(trimmed_line);
  });

  flush_paragraph();
  flush_list();

  return content_blocks;
};

export default function UserGuidePage() {
  const [guide_loading, set_guide_loading] = useState(true);
  const [guide_error, set_guide_error] = useState("");
  const [guide_markdown, set_guide_markdown] = useState("");
  const [active_section_id, set_active_section_id] = useState(null);
  const section_refs = useRef({});

  const load_guide = useCallback(async () => {
    set_guide_loading(true);
    set_guide_error("");

    try {
      const response = await fetch(GUIDE_FETCH_PATH, {
        headers: {
          Accept: "text/markdown,text/plain,*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to fetch user guide (${response.status})`);
      }

      const markdown_text = await response.text();
      set_guide_markdown(markdown_text);
      console.log("[UserGuide] markdown loaded", {
        length: markdown_text.length,
      });
    } catch (ex) {
      const message_value =
        ex?.message || "Unable to load guide content. Please try again.";
      set_guide_error(message_value);
      set_guide_markdown("");
      console.error("[UserGuide] markdown load error", ex);
    } finally {
      set_guide_loading(false);
    }
  }, []);

  useEffect(() => {
    load_guide();
  }, [load_guide]);

  const parsed_guide = useMemo(() => {
    return parse_guide_markdown(guide_markdown);
  }, [guide_markdown]);

  const sidebar_items = useMemo(() => {
    return (parsed_guide.sections || []).map((section_row, section_index) => ({
      id: section_row.id,
      label: section_row.title,
      extralabel: `Section ${section_index + 1}`,
    }));
  }, [parsed_guide.sections]);

  const default_open_item_ids = useMemo(() => {
    return sidebar_items.slice(0, 1).map((item) => item.id);
  }, [sidebar_items]);

  useEffect(() => {
    if (!parsed_guide.sections.length) {
      set_active_section_id(null);
      return;
    }

    set_active_section_id((prev_state) => {
      if (prev_state && parsed_guide.sections.some((section_row) => section_row.id === prev_state)) {
        return prev_state;
      }

      return parsed_guide.sections[0]?.id || null;
    });
  }, [parsed_guide.sections]);

  const handle_sidebar_item_click = useCallback((section_id) => {
    if (!section_id) return;

    set_active_section_id(section_id);

    const section_node = section_refs.current[section_id];
    if (!section_node) return;

    section_node.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className={styles.user_guide_root}>
      <ExtraSideBar
        title="User Guide"
        items={sidebar_items}
        on_item_click={handle_sidebar_item_click}
        active_item_id_external={active_section_id}
        default_open_item_ids={default_open_item_ids}
      />

      <div className={styles.user_guide_content_root}>
        <h1 className={styles.page_title}>{parsed_guide.page_title}</h1>

        {guide_loading && (
          <div className={styles.page_state}>
            <div className="spinner"></div>
            <span>Loading user guide...</span>
          </div>
        )}

        {guide_error && !guide_loading && (
          <div className={styles.page_error}>
            <p>{guide_error}</p>
            <button className="btn primary" type="button" onClick={load_guide}>
              Retry
            </button>
          </div>
        )}

        {!guide_loading && !guide_error && (
          <div className={styles.sections_root}>
            {parsed_guide.sections.map((section_row) => {
              const section_blocks = render_section_content(section_row.lines);

              return (
                <section
                  key={section_row.id}
                  id={section_row.id}
                  ref={(node) => {
                    section_refs.current[section_row.id] = node;
                  }}
                  className={styles.section_card}
                >
                  <h2 className={styles.section_title}>{section_row.title}</h2>

                  <div className={styles.section_content}>
                    {section_blocks.map((block_row, block_index) => {
                      if (block_row.type === "h3") {
                        return (
                          <h3 key={`${section_row.id}-h3-${block_index}`} className={styles.section_subtitle}>
                            {block_row.text}
                          </h3>
                        );
                      }

                      if (block_row.type === "list") {
                        const is_ordered = block_row.list_type === "ordered";

                        if (is_ordered) {
                          return (
                            <ol key={`${section_row.id}-list-${block_index}`} className={styles.section_ordered_list}>
                              {block_row.items.map((list_item, list_index) => (
                                <li key={`${section_row.id}-list-item-${block_index}-${list_index}`}>
                                  {list_item}
                                </li>
                              ))}
                            </ol>
                          );
                        }

                        return (
                          <ul key={`${section_row.id}-list-${block_index}`} className={styles.section_list}>
                            {block_row.items.map((list_item, list_index) => (
                              <li key={`${section_row.id}-list-item-${block_index}-${list_index}`}>
                                {list_item}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      if (block_row.type === "image") {
                        return (
                          <figure key={`${section_row.id}-img-${block_index}`} className={styles.section_image_root}>
                            <img
                              src={block_row.src}
                              alt={block_row.alt || "Guide image"}
                              title={block_row.title || block_row.alt || "Guide image"}
                              className={styles.section_image}
                              loading="lazy"
                            />
                            {!!block_row.alt && <figcaption className={styles.section_image_caption}>{block_row.alt}</figcaption>}
                          </figure>
                        );
                      }

                      return (
                        <p key={`${section_row.id}-p-${block_index}`} className={styles.section_paragraph}>
                          {block_row.text}
                        </p>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
