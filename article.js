const posts = {
  "art-of-yolo": "posts/art-of-yolo.txt?v=18",
  "gen-chem-nightmare": "posts/gen-chem-nightmare.txt?v=18",
  "science-fair": "posts/science-fair.txt?v=18",
};

const titleEl = document.getElementById("article-title");
const dateEl = document.getElementById("article-date");
const bodyEl = document.getElementById("article-body");
const windowTitleEl = document.getElementById("article-window-title");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatInline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+?)\*/g, "<em>$1</em>")
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

function renderTable(rows) {
  const [header, ...body] = rows;
  const headings = header
    .split("\t")
    .map((cell) => `<th>${formatInline(cell.trim())}</th>`)
    .join("");
  const content = body
    .map((row) => {
      const cells = row
        .split("\t")
        .map((cell) => `<td>${formatInline(cell.trim())}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<div class="article-table-wrap"><table><thead><tr>${headings}</tr></thead><tbody>${content}</tbody></table></div>`;
}

function renderArticle(source) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const title = lines.shift()?.trim() || "Untitled";
  const date = lines.shift()?.trim() || "";
  const output = [];
  let paragraph = [];
  let inAside = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = raw.trim();

    if (line === "<aside>") {
      flushParagraph();
      output.push("<aside>");
      inAside = true;
      continue;
    }

    if (line === "</aside>") {
      flushParagraph();
      output.push("</aside>");
      inAside = false;
      continue;
    }

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.includes("\t")) {
      flushParagraph();
      const rows = [raw];
      while (index + 1 < lines.length && lines[index + 1].includes("\t")) {
        rows.push(lines[index + 1]);
        index += 1;
      }
      output.push(renderTable(rows));
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      output.push(`<h3>${formatInline(line.slice(3))}</h3>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      output.push(`<h2>${formatInline(line.slice(2))}</h2>`);
      continue;
    }

    const youtubeMatch = line.match(
      /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (youtubeMatch) {
      flushParagraph();
      output.push(
        `<div class="article-video"><iframe src="https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}" title="Science fair video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
      );
      continue;
    }

    if (line.startsWith("!")) {
      flushParagraph();
      const isSophomorePoster = line.includes("Screenshot 2024-12-25");
      const isNationalPoster = line.includes("Poster_JSHS");
      const imagePath = isSophomorePoster
        ? "assets/science-fair-sophomore.jpg"
        : isNationalPoster
          ? "assets/science-fair-national.jpg"
          : "";

      if (imagePath) {
        const caption = isSophomorePoster
          ? "My Illinois-Chicago JSHS poster"
          : "My National JSHS poster";
        output.push(
          `<figure class="article-poster"><a href="${imagePath}" target="_blank" rel="noopener"><img src="${imagePath}" alt="${caption}"></a><figcaption>${caption} — click to view full size</figcaption></figure>`
        );
      } else {
        output.push(
          `<p class="article-media-note">Photo referenced in original draft: ${formatInline(line.slice(1))}</p>`
        );
      }
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  if (inAside) output.push("</aside>");

  titleEl.textContent = title;
  dateEl.textContent = date;
  bodyEl.innerHTML = output.join("");
  windowTitleEl.textContent = `${title.toLowerCase().replaceAll(" ", "-")}.txt`;
  document.title = `${title} — Ryan Cho`;
}

async function loadArticle() {
  const slug = new URLSearchParams(window.location.search).get("post");
  const sourcePath = posts[slug];

  if (!sourcePath) {
    titleEl.textContent = "Article not found";
    dateEl.textContent = "";
    bodyEl.innerHTML = '<p><a href="blog.html">Return to all writing.</a></p>';
    return;
  }

  try {
    const response = await fetch(sourcePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderArticle(await response.text());
  } catch (error) {
    titleEl.textContent = "Couldn’t open this article";
    dateEl.textContent = "";
    bodyEl.textContent = "Please try refreshing the page.";
    console.error(error);
  }
}

loadArticle();
