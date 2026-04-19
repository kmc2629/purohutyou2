const SP_OPTIONS = [
  "Deloitte.",
  "SONY",
  "CTC",
  "MIXI",
  "SEPTENI",
  "SoftBank",
  "FUJITSU",
  "ROHTO",
  "sansan",
  "SECOM",
  "RICOH"
];

const SAMPLE_POSTS = [
  {
    id: "sample-1",
    name: "青木 すず",
    kana: "あおきすず",
    grade: "一年",
    sp: "SONY",
    birthday: "2006-04-12",
    mbti: "ENFP",
    image: "https://picsum.photos/seed/aoki-suzu/900/680",
    baseTags: ["企画", "写真", "春生まれ", "音楽", "聞き上手"],
    note: "",
    updatedAt: "2026-04-10T10:30:00.000Z"
  },
  {
    id: "sample-2",
    name: "伊藤 まこと",
    kana: "いとうまこと",
    grade: "三年",
    sp: "MIXI",
    birthday: "2004-11-03",
    mbti: "INTJ",
    image: "https://picsum.photos/seed/ito-makoto/900/680",
    baseTags: ["分析", "ゲーム", "秋生まれ", "設計", "夜型"],
    note: "",
    updatedAt: "2026-04-13T12:00:00.000Z"
  },
  {
    id: "sample-3",
    name: "加藤 ゆい",
    kana: "かとうゆい",
    grade: "二年",
    sp: "Deloitte.",
    birthday: "2005-07-21",
    mbti: "ISFJ",
    image: "https://picsum.photos/seed/kato-yui/900/680",
    baseTags: ["夏生まれ", "資料作成", "相談", "旅行", "丁寧"],
    note: "",
    updatedAt: "2026-04-12T09:00:00.000Z"
  },
  {
    id: "sample-4",
    name: "佐藤 ひかり",
    kana: "さとうひかり",
    grade: "四年",
    sp: "SoftBank",
    birthday: "2003-01-18",
    mbti: "ENTP",
    image: "https://picsum.photos/seed/sato-hikari/900/680",
    baseTags: ["発表", "冬生まれ", "リーダー", "AI", "アイデア"],
    note: "",
    updatedAt: "2026-04-16T15:45:00.000Z"
  },
  {
    id: "sample-5",
    name: "田中 れん",
    kana: "たなかれん",
    grade: "一年",
    sp: "RICOH",
    birthday: "2006-09-09",
    mbti: "ISTP",
    image: "https://picsum.photos/seed/tanaka-ren/900/680",
    baseTags: ["ものづくり", "カメラ", "秋生まれ", "静か", "実装"],
    note: "",
    updatedAt: "2026-04-11T08:20:00.000Z"
  },
  {
    id: "sample-6",
    name: "森 なお",
    kana: "もりなお",
    grade: "二年",
    sp: "sansan",
    birthday: "2005-05-30",
    mbti: "INFJ",
    image: "https://picsum.photos/seed/mori-nao/900/680",
    baseTags: ["読書", "春生まれ", "文章", "観察", "デザイン"],
    note: "",
    updatedAt: "2026-04-17T07:05:00.000Z"
  }
];

const STORAGE_KEY = "tag-portraits-posts-v1";
const VIEWER_KEY = "tag-portraits-viewer-edits-v1";

const state = {
  posts: loadPosts(),
  edits: loadViewerEdits(),
  filters: {
    query: "",
    match: "partial",
    category: "all",
    grade: "all",
    sp: "all",
    sort: "kana"
  }
};

const els = {
  grid: document.querySelector("#profileGrid"),
  template: document.querySelector("#cardTemplate"),
  resultCount: document.querySelector("#resultCount"),
  popularTags: document.querySelector("#popularTags"),
  searchInput: document.querySelector("#searchInput"),
  matchMode: document.querySelector("#matchMode"),
  categoryFilter: document.querySelector("#categoryFilter"),
  gradeFilter: document.querySelector("#gradeFilter"),
  spFilter: document.querySelector("#spFilter"),
  spInput: document.querySelector("#spInput"),
  gradeWrap: document.querySelector("#gradeWrap"),
  spWrap: document.querySelector("#spWrap"),
  sortMode: document.querySelector("#sortMode"),
  adminForm: document.querySelector("#adminForm")
};

init();

function init() {
  hydrateSelects();
  bindControls();
  render();
}

function hydrateSelects() {
  els.spFilter.innerHTML = '<option value="all">すべて</option>' + SP_OPTIONS.map(toOption).join("");
  els.spInput.innerHTML = SP_OPTIONS.map(toOption).join("");
}

function toOption(value) {
  return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
}

function bindControls() {
  els.searchInput.addEventListener("input", event => {
    state.filters.query = event.target.value.trim();
    render();
  });

  els.matchMode.addEventListener("change", event => {
    state.filters.match = event.target.value;
    render();
  });

  els.categoryFilter.addEventListener("change", event => {
    state.filters.category = event.target.value;
    updateCategoryVisibility();
    render();
  });

  els.gradeFilter.addEventListener("change", event => {
    state.filters.grade = event.target.value;
    render();
  });

  els.spFilter.addEventListener("change", event => {
    state.filters.sp = event.target.value;
    render();
  });

  els.sortMode.addEventListener("change", event => {
    state.filters.sort = event.target.value;
    render();
  });

  els.adminForm.addEventListener("submit", async event => {
    event.preventDefault();
    await addPost();
  });

  updateCategoryVisibility();
}

function updateCategoryVisibility() {
  const category = state.filters.category;
  els.gradeWrap.classList.toggle("hidden", category !== "grade");
  els.spWrap.classList.toggle("hidden", category !== "sp");
}

function render() {
  const posts = getFilteredPosts();
  els.grid.innerHTML = "";
  els.resultCount.textContent = posts.length;
  renderPopularTags();

  if (posts.length === 0) {
    els.grid.innerHTML = '<p class="empty">条件に合う投稿がありません。</p>';
    return;
  }

  posts.forEach(post => els.grid.appendChild(createCard(post)));
}

function getFilteredPosts() {
  return state.posts
    .filter(post => {
      if (state.filters.category === "grade" && state.filters.grade !== "all" && post.grade !== state.filters.grade) {
        return false;
      }
      if (state.filters.category === "sp" && state.filters.sp !== "all" && post.sp !== state.filters.sp) {
        return false;
      }
      return matchesQuery(post);
    })
    .sort(sortPosts);
}

function matchesQuery(post) {
  const query = normalize(state.filters.query);
  if (!query) return true;

  const values = [post.name, ...getSearchableTags(post)].map(normalize);
  if (state.filters.match === "exact") {
    return values.some(value => value === query);
  }
  return values.some(value => value.includes(query));
}

function sortPosts(a, b) {
  if (state.filters.sort === "birthday") {
    return birthdayKey(a.birthday) - birthdayKey(b.birthday);
  }
  if (state.filters.sort === "updated") {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  }
  return a.kana.localeCompare(b.kana, "ja");
}

function birthdayKey(dateString) {
  const date = new Date(dateString);
  return (date.getMonth() + 1) * 100 + date.getDate();
}

function createCard(post) {
  const fragment = els.template.content.cloneNode(true);
  const card = fragment.querySelector(".profile-card");
  const title = fragment.querySelector("h3");
  const tags = fragment.querySelector(".tag-list");
  const image = fragment.querySelector(".profile-image");
  const note = fragment.querySelector(".viewer-note");
  const editToggle = fragment.querySelector(".edit-toggle");
  const editPanel = fragment.querySelector(".edit-panel");
  const tagEditor = fragment.querySelector(".tag-editor");
  const noteEditor = fragment.querySelector(".note-editor");
  const suggestions = fragment.querySelector(".suggestions");
  const saveButton = fragment.querySelector(".save-edit");

  const edit = state.edits[post.id] || { tags: [], note: "" };
  title.textContent = post.name;
  image.src = post.image;
  image.alt = `${post.name}の投稿画像`;
  note.textContent = edit.note || "一言メモはまだありません。";
  noteEditor.value = edit.note || "";
  renderTags(tags, post);
  renderSuggestions(suggestions, post, "");

  editToggle.addEventListener("click", () => {
    editPanel.hidden = !editPanel.hidden;
  });

  tagEditor.addEventListener("input", event => {
    renderSuggestions(suggestions, post, event.target.value);
  });

  suggestions.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    tagEditor.value = button.dataset.tag;
    tagEditor.focus();
  });

  saveButton.addEventListener("click", () => {
    const nextTag = cleanTag(tagEditor.value);
    const current = state.edits[post.id] || { tags: [], note: "" };
    const mergedTags = nextTag ? unique([...current.tags, nextTag]).slice(0, 10) : current.tags;
    state.edits[post.id] = {
      tags: mergedTags,
      note: noteEditor.value.trim()
    };
    post.updatedAt = new Date().toISOString();
    tagEditor.value = "";
    saveAll();
    render();
  });

  card.dataset.id = post.id;
  return fragment;
}

function renderTags(container, post) {
  container.innerHTML = "";
  const tags = [
    post.grade,
    post.sp,
    formatBirthday(post.birthday),
    post.mbti,
    ...getTags(post)
  ].filter(Boolean);

  tags.slice(0, 10).forEach((tag, index) => {
    const span = document.createElement("span");
    span.className = index < 4 ? "pill meta" : "pill";
    span.textContent = `#${tag}`;
    container.appendChild(span);
  });
}

function renderPopularTags() {
  els.popularTags.innerHTML = "";
  getPopularTags().slice(0, 8).forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill clickable accent";
    button.textContent = `#${tag.name}`;
    button.title = `${tag.count}件`;
    button.addEventListener("click", () => {
      els.searchInput.value = tag.name;
      state.filters.query = tag.name;
      render();
    });
    els.popularTags.appendChild(button);
  });
}

function renderSuggestions(container, post, query) {
  container.innerHTML = "";
  getSuggestions(post, query).forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill clickable";
    button.dataset.tag = tag;
    button.textContent = `#${tag}`;
    container.appendChild(button);
  });
}

function getSuggestions(post, query) {
  const cleaned = normalize(cleanTag(query));
  const used = new Set(getTags(post).map(normalize));
  return getPopularTags()
    .map(tag => tag.name)
    .filter(tag => !used.has(normalize(tag)))
    .filter(tag => !cleaned || normalize(tag).includes(cleaned) || cleaned.includes(normalize(tag)))
    .slice(0, 6);
}

function getPopularTags() {
  const counts = new Map();
  state.posts.flatMap(getTags).forEach(tag => {
    counts.set(tag, (counts.get(tag) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));
}

function getTags(post) {
  const edit = state.edits[post.id] || { tags: [] };
  return unique([...(post.baseTags || []), ...(edit.tags || [])]).slice(0, 10);
}

function getSearchableTags(post) {
  return [
    post.grade,
    post.sp,
    formatBirthday(post.birthday),
    post.mbti,
    ...getTags(post)
  ].filter(Boolean);
}

async function addPost() {
  const password = document.querySelector("#adminPassword").value;
  if (password !== "admin") {
    alert("管理パスワードが違います。デモでは admin です。");
    return;
  }

  const imageFile = document.querySelector("#imageFileInput").files[0];
  const imageUrl = document.querySelector("#imageInput").value.trim();

  const post = {
    id: `post-${Date.now()}`,
    name: document.querySelector("#nameInput").value.trim(),
    kana: document.querySelector("#kanaInput").value.trim(),
    grade: document.querySelector("#gradeInput").value,
    sp: document.querySelector("#spInput").value,
    birthday: document.querySelector("#birthdayInput").value,
    mbti: document.querySelector("#mbtiInput").value.trim().toUpperCase(),
    image: imageFile ? await readImageFile(imageFile) : imageUrl || `https://picsum.photos/seed/${Date.now()}/900/680`,
    baseTags: parseTags(document.querySelector("#tagsInput").value),
    note: "",
    updatedAt: new Date().toISOString()
  };

  if (!post.name || !post.kana || !post.birthday) {
    alert("名前、よみ、誕生日を入力してください。");
    return;
  }

  state.posts.push(post);
  saveAll();
  els.adminForm.reset();
  hydrateSelects();
  render();
  document.querySelector("#gallery").scrollIntoView({ behavior: "smooth" });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function parseTags(value) {
  return unique(value.split(/[,\s、]+/).map(cleanTag).filter(Boolean)).slice(0, 10);
}

function cleanTag(value) {
  return value.replace(/^#/, "").trim();
}

function formatBirthday(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || SAMPLE_POSTS;
  } catch {
    return SAMPLE_POSTS;
  }
}

function loadViewerEdits() {
  try {
    return JSON.parse(localStorage.getItem(VIEWER_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
  localStorage.setItem(VIEWER_KEY, JSON.stringify(state.edits));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}
