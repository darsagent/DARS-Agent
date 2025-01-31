export const highlightMarkdown = (text: string, query: string | undefined) => {
  if (!query || !query.trim() || query.trim() == "") return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(
    regex,
    `<mark style="background-color: yellow;">$1</mark>`
  );
};

export const highlightText = (text: string, query: string | undefined) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} style={{ backgroundColor: "yellow" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

export const checkQueryInText = (text: string, query: string) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(`(${escapedQuery})`, "i");

  return regex.test(escapedText);
};
