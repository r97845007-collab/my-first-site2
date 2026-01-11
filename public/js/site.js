const posts = [
  {
    id: 1,
    type: "photo",
    caption: "Утренний маршрут по набережной — мягкий старт для новичков.",
    routeTag: "Новичкам",
    durationLabel: "1 час",
    level: "Новичок",
    hashtags: ["#утро", "#набережная", "#новичкам"],
    dateCreated: "2024-11-18",
  },
  {
    id: 2,
    type: "reel",
    caption: "Закатный рилс: золотой свет и спокойные лошади.",
    routeTag: "Закат",
    durationLabel: "2 часа",
    level: "Средний",
    hashtags: ["#закат", "#рилс", "#пейзаж"],
    dateCreated: "2024-12-02",
  },
  {
    id: 3,
    type: "photo",
    caption: "Семейная прогулка с фотостопом у смотровой точки.",
    routeTag: "Семейный",
    durationLabel: "1.5 часа",
    level: "Новичок",
    hashtags: ["#семья", "#дети", "#фото"],
    dateCreated: "2024-12-12",
  },
  {
    id: 4,
    type: "reel",
    caption: "Рилс из Долины впечатлений — атмосфера сосен и тишины.",
    routeTag: "Долина",
    durationLabel: "2 часа",
    level: "Средний",
    hashtags: ["#долина", "#релакс", "#природа"],
    dateCreated: "2024-12-20",
  },
  {
    id: 5,
    type: "photo",
    caption: "Маршрут “Смотровой” — идеален для эффектных кадров.",
    routeTag: "Смотровой",
    durationLabel: "3 часа",
    level: "Средний",
    hashtags: ["#смотровой", "#фото", "#панорама"],
    dateCreated: "2024-12-25",
  },
  {
    id: 6,
    type: "photo",
    caption: "Новичкам: спокойные лошади и инструктаж перед стартом.",
    routeTag: "Новичкам",
    durationLabel: "1 час",
    level: "Новичок",
    hashtags: ["#инструктаж", "#новичкам", "#безопасно"],
    dateCreated: "2025-01-03",
  },
  {
    id: 7,
    type: "reel",
    caption: "Рилс на пляжном участке — как в кино.",
    routeTag: "Закат",
    durationLabel: "1.5 часа",
    level: "Новичок",
    hashtags: ["#пляж", "#рилс", "#закат"],
    dateCreated: "2025-01-07",
  },
  {
    id: 8,
    type: "photo",
    caption: "Семейный маршрут с короткими остановками и чаем.",
    routeTag: "Семейный",
    durationLabel: "1.5 часа",
    level: "Новичок",
    hashtags: ["#семейный", "#чай", "#уют"],
    dateCreated: "2025-01-09",
  },
  {
    id: 9,
    type: "photo",
    caption: "Долина: едем по хвойной тропе и слушаем тишину.",
    routeTag: "Долина",
    durationLabel: "2 часа",
    level: "Средний",
    hashtags: ["#хвоя", "#долина", "#спокойствие"],
    dateCreated: "2025-01-12",
  },
  {
    id: 10,
    type: "reel",
    caption: "Мини-рилс: вечерний круг, мягкий свет, спокойная музыка.",
    routeTag: "Закат",
    durationLabel: "1 час",
    level: "Новичок",
    hashtags: ["#вечер", "#рилс", "#атмосфера"],
    dateCreated: "2025-01-15",
  },
];

const stories = [
  { id: "st1", title: "Сегодня свободно", subtitle: "3 слота" },
  { id: "st2", title: "Новые маршруты", subtitle: "добавили смотровой" },
  { id: "st3", title: "Скидка в будни", subtitle: "-10%" },
  { id: "st4", title: "Совет недели", subtitle: "что взять с собой" },
];

const slots = [
  { id: "slot-1", date: "2025-02-01", time: "09:00", label: "Утренний" },
  { id: "slot-2", date: "2025-02-01", time: "11:30", label: "Дневной" },
  { id: "slot-3", date: "2025-02-02", time: "16:30", label: "Закат" },
  { id: "slot-4", date: "2025-02-03", time: "18:00", label: "Вечерний" },
];

const reviews = [
  {
    id: "r1",
    author: "Мария",
    text: "Очень спокойные лошади и уютный маршрут. Инструктор супер!",
  },
  {
    id: "r2",
    author: "Илья",
    text: "Закатный маршрут — must have. Атмосфера невероятная.",
  },
  {
    id: "r3",
    author: "Ольга",
    text: "Поехали всей семьей, детям понравилось. Спасибо за заботу!",
  },
];

const state = {
  likes: {},
  saves: {},
  comments: {},
  theme: "light",
  selectedRoute: null,
  selectedSlot: null,
  selectedDate: null,
};

const STORAGE_KEY = "cavalry-state";
const ASSETS = {
  story: "assets/images/stories/story-placeholder.svg",
  photo: "assets/images/posts/photo-placeholder.svg",
  reel: "assets/images/posts/reel-placeholder.svg",
  review: "assets/images/ui/review-placeholder.svg",
};


const elements = {
  topbar: document.querySelector(".topbar"),
  storiesList: document.getElementById("stories-list"),
  feedGrid: document.getElementById("feed-grid"),
  feedStatus: document.getElementById("feed-status"),
  showMore: document.getElementById("show-more"),
  filterChips: document.querySelectorAll(".chip"),
  feedSearch: document.getElementById("feed-search"),
  globalSearch: document.getElementById("global-search"),
  sortSelect: document.getElementById("sort-select"),
  storyModal: document.getElementById("story-modal"),
  storyContent: document.getElementById("story-content"),
  commentModal: document.getElementById("comment-modal"),
  commentList: document.getElementById("comment-list"),
  commentForm: document.getElementById("comment-form"),
  reviewModal: document.getElementById("review-modal"),
  reviewForm: document.getElementById("review-form"),
  reviewFiles: document.getElementById("review-files"),
  reviewPreview: document.getElementById("review-preview"),
  reviewAlert: document.getElementById("review-alert"),
  reviewStatus: document.getElementById("review-status"),
  openReview: document.getElementById("open-review"),
  reviewCta: document.getElementById("review-cta"),
  themeToggle: document.getElementById("theme-toggle"),
  menuToggle: document.getElementById("menu-toggle"),
  menuClose: document.getElementById("menu-close"),
  menuOverlay: document.getElementById("menu-overlay"),
  mobileMenu: document.getElementById("mobile-menu"),
  favoritesOpen: document.getElementById("favorites-open"),
  favoritesModal: document.getElementById("favorites-modal"),
  favoritesList: document.getElementById("favorites-list"),
  favoritesEmpty: document.getElementById("favorites-empty"),
  calendarGrid: document.getElementById("calendar-grid"),
  calendarMonth: document.getElementById("calendar-month"),
  calendarPrev: document.getElementById("calendar-prev"),
  calendarNext: document.getElementById("calendar-next"),
  calendarSlots: document.getElementById("calendar-slots"),
  calendarDayTitle: document.getElementById("calendar-day-title"),
  routeGrid: document.getElementById("route-grid"),
  slotGrid: document.getElementById("slot-grid"),
  bookingForm: document.getElementById("booking-form"),
  formAlert: document.getElementById("form-alert"),
  telegramStatus: document.getElementById("telegram-status"),
  reviewGrid: document.getElementById("review-grid"),
  reelViewer: document.getElementById("reel-viewer"),
  reelTrack: document.getElementById("reel-track"),
  reelClose: document.getElementById("reel-close"),
};

let activeFilter = "all";
let visibleCount = 6;
let activePostId = null;
let postsData = [...posts];
let storiesData = [...stories];
let slotsData = [...slots];
let feedCursor = null;
let feedHasMore = true;
let feedLoading = false;
let feedFromApi = false;
let feedSentinel = null;
let reelObserver = null;

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  state.likes = parsed.likes || {};
  state.saves = parsed.saves || {};
  state.comments = parsed.comments || {};
  state.theme = parsed.theme || "light";
  state.selectedRoute = parsed.selectedRoute || null;
  state.selectedSlot = parsed.selectedSlot || null;
  state.selectedDate = parsed.selectedDate || null;
};

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.setAttribute("aria-pressed", state.theme === "dark");
};

const applyTopbarState = () => {
  if (!elements.topbar) return;
  elements.topbar.classList.toggle("topbar--compact", window.scrollY > 80);
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "include", ...options });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};
  if (!response.ok) {
    const message = data.error || "Ошибка запроса";
    throw new Error(message);
  }
  return data;
};

const parseHashtags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const splitHashtags = (input) =>
    String(input)
      .split(/[\s,]+/)
      .filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : splitHashtags(value);
  } catch (error) {
    return splitHashtags(value);
  }
};

const normalizePost = (post) => ({
  ...post,
  routeTag: post.routeTag || post.route_tag || "Маршрут",
  durationLabel: post.durationLabel || post.duration_label || "",
  level: post.level || post.level_label || "",
  hashtags: parseHashtags(post.hashtags),
  dateCreated: post.dateCreated || post.created_at || new Date().toISOString(),
  favorites_count: Number(post.favorites_count || 0),
  comments_count: Number(post.comments_count || 0),
  is_favorited: Boolean(post.is_favorited),
});

const normalizeSlot = (slot) => ({
  ...slot,
  label: slot.label || slot.route_tag || "Свободный слот",
  time: slot.time || slot.time_slot || "",
});

const routeLabel = (tag) => {
  if (!tag || tag === "all") return "Все маршруты";
  return tag;
};

const scrollToFeed = () => {
  const headerOffset = document.querySelector(".topbar")?.offsetHeight || 0;
  const feed = document.getElementById("feed");
  const top = feed.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
  window.scrollTo({ top, behavior: "smooth" });
};

const renderStories = () => {
  elements.storiesList.innerHTML = "";
  storiesData.forEach((story) => {
    const subtitle = story.subtitle || story.text || "Свежий момент";
    const card = document.createElement("button");
    card.type = "button";
    card.className = "story-card";
    card.innerHTML = `
      <img class="story-avatar" src="${ASSETS.story}" alt="Воспоминание ${story.title}" loading="lazy" />
      <div>${story.title}</div>
      <small class="hint">${subtitle}</small>
    `;
    card.addEventListener("click", () => openStory(story));
    elements.storiesList.appendChild(card);
  });
};

const openStory = (story) => {
  const mediaUrl = story.media_url || "";
  const mediaKind = story.media_kind === "video" || story.media_kind === "telegram_video" ? "video" : "photo";
  const hasMedia = Boolean(mediaUrl);
  elements.storyContent.innerHTML = `
    <h3>${story.title}</h3>
    <p>${story.subtitle || story.text || ""}</p>
    <div class="media">
      ${
        hasMedia && mediaKind === "video"
          ? `<video src="${mediaUrl}" controls preload="metadata"></video>`
          : `<img src="${hasMedia ? mediaUrl : ASSETS.photo}" alt="Воспоминание ${story.title}" loading="lazy" />`
      }
    </div>
  `;
  const img = elements.storyContent.querySelector("img");
  if (img && !hasMedia) {
    img.addEventListener("error", () => {
      img.src = ASSETS.photo;
    });
  }
  elements.storyModal.showModal();
};

const getPopularityScore = (post) => {
  if (feedFromApi) {
    return (post.favorites_count || 0) + (post.comments_count || 0);
  }
  const likeScore = state.likes[post.id] ? 1 : 0;
  const commentScore = (state.comments[post.id] || []).length;
  return likeScore + commentScore;
};

const matchesSearch = (post, query) => {
  if (!query) return true;
  const lower = query.toLowerCase();
  return (
    post.caption.toLowerCase().includes(lower) ||
    post.hashtags.some((tag) => tag.toLowerCase().includes(lower))
  );
};

const filteredPosts = () => {
  if (feedFromApi) {
    return postsData;
  }
  const query = elements.feedSearch.value.trim() || elements.globalSearch.value.trim();
  return postsData
    .filter((post) => (activeFilter === "all" ? true : post.routeTag === activeFilter))
    .filter((post) => matchesSearch(post, query))
    .sort((a, b) => {
      if (elements.sortSelect.value === "new") {
        return new Date(b.dateCreated) - new Date(a.dateCreated);
      }
      return getPopularityScore(b) - getPopularityScore(a);
    });
};

const renderPosts = () => {
  const list = filteredPosts();
  const visible = feedFromApi ? list : list.slice(0, visibleCount);
  elements.feedGrid.innerHTML = "";
  visible.forEach((post) => elements.feedGrid.appendChild(createPostCard(post)));
  if (feedFromApi && feedSentinel) {
    elements.feedGrid.appendChild(feedSentinel);
  }
  elements.showMore.hidden = feedFromApi ? !feedHasMore : visible.length >= list.length;
};

const createPostCard = (post) => {
  const card = document.createElement("article");
  card.className = "post-card";
  card.id = `post-${post.id}`;
  const liked = feedFromApi ? Boolean(post.is_favorited) : Boolean(state.likes[post.id]);
  const saved = Boolean(state.saves[post.id]);
  const commentsCount = feedFromApi ? post.comments_count || 0 : (state.comments[post.id] || []).length;
  const mediaKind = post.media_kind === "video" || post.media_kind === "telegram_video" ? "video" : "photo";
  const mediaUrl = post.media_url || "";
  const fallbackSrc = post.type === "reel" ? ASSETS.reel : ASSETS.photo;
  const isReel = post.type === "reel" || post.media_kind === "telegram_video" || mediaKind === "video";
  card.innerHTML = `
    <div class="media ${isReel ? "reel" : ""}">
      ${
        mediaUrl && mediaKind === "video"
          ? `<video src="${mediaUrl}" playsinline controls preload="metadata"></video>`
          : `<img src="${mediaUrl || fallbackSrc}" alt="${isReel ? "Рилс" : "Фото"}: ${post.caption}" loading="lazy" />`
      }
      ${
        isReel && !mediaUrl
          ? `<div class="reel-overlay" aria-hidden="true">
              <div class="play">▶</div>
              <div class="reel-label">видео будет добавлено позже</div>
            </div>`
          : ""
      }
    </div>
    <div>
      <strong>${post.caption}</strong>
      <div class="post-meta">
        <span>${post.routeTag}</span>
        <span>${post.durationLabel}</span>
        <span>${post.level}</span>
      </div>
      <div class="post-meta">${post.hashtags.join(" ")}</div>
    </div>
      <div class="post-actions">
      <div>
        <button class="icon-btn ${liked ? "is-active" : ""}" data-action="like" aria-pressed="${liked}">
          ❤️ ${feedFromApi ? post.favorites_count || 0 : liked ? "Лайк" : "Лайк"}
        </button>
        <button class="icon-btn ${saved ? "is-active" : ""}" data-action="save" aria-pressed="${saved}">
          🔖 Сохранить
        </button>
        <button class="icon-btn" data-action="comment">💬 ${commentsCount}</button>
      </div>
      <div>
        <button class="icon-btn" data-action="share">🔗 Поделиться</button>
        <a class="btn btn--ghost" href="#funnel">Записаться</a>
      </div>
    </div>
  `;

  card.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => handlePostAction(post, button.dataset.action));
  });
  const img = card.querySelector("img");
  if (img) {
    img.addEventListener("error", () => {
      img.src = fallbackSrc;
    });
  }
  if (isReel && mediaUrl) {
    const media = card.querySelector(".media");
    media.classList.add("is-clickable");
    media.addEventListener("click", () => openReelViewer(post.id));
  }

  return card;
};

const handlePostAction = async (post, action) => {
  if (action === "like") {
    if (!feedFromApi) {
      state.likes[post.id] = !state.likes[post.id];
      saveState();
      renderPosts();
      return;
    }
    try {
      const nextState = !post.is_favorited;
      await fetchJson("/api/favorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, state: nextState }),
      });
      post.is_favorited = nextState;
      post.favorites_count = Math.max(0, (post.favorites_count || 0) + (nextState ? 1 : -1));
      renderPosts();
    } catch (error) {
      alert(error.message || "Нужна авторизация для лайка.");
    }
  }
  if (action === "save") {
    state.saves[post.id] = !state.saves[post.id];
    saveState();
    renderPosts();
  }
  if (action === "comment") {
    openComments(post.id);
  }
  if (action === "share") {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: post.caption,
          url,
        });
        elements.telegramStatus.textContent = "Открыто меню отправки";
      } else {
        await navigator.clipboard.writeText(url);
        elements.telegramStatus.textContent = "Ссылка скопирована";
      }
    } catch (error) {
      elements.telegramStatus.textContent = "Скопируйте ссылку вручную: " + url;
    }
  }
};

const renderFavorites = () => {
  if (!elements.favoritesList) return;
  const savedIds = Object.keys(state.saves).filter((id) => state.saves[id]);
  const savedPosts = savedIds
    .map((id) => postsData.find((post) => String(post.id) === String(id)))
    .filter(Boolean);
  elements.favoritesList.innerHTML = "";
  savedPosts.forEach((post) => elements.favoritesList.appendChild(createPostCard(post)));
  elements.favoritesEmpty.hidden = savedPosts.length > 0;
};

const getReelPosts = () =>
  postsData.filter(
    (post) =>
      post.media_url &&
      (post.type === "reel" || post.media_kind === "video" || post.media_kind === "telegram_video")
  );

const openReelViewer = (postId) => {
  if (!elements.reelViewer || !elements.reelTrack) return;
  const reels = getReelPosts();
  if (!reels.length) return;
  elements.reelTrack.innerHTML = "";
  reels.forEach((post) => {
    const item = document.createElement("section");
    item.className = "reel-item";
    item.dataset.postId = post.id;
    item.innerHTML = `
      <video src="${post.media_url}" playsinline controls preload="metadata"></video>
    `;
    elements.reelTrack.appendChild(item);
  });
  elements.reelViewer.showModal();
  document.body.classList.add("body--locked");

  const index = Math.max(
    0,
    reels.findIndex((post) => post.id === postId)
  );
  const scrollTarget = elements.reelTrack.clientHeight * index;
  elements.reelTrack.scrollTop = scrollTarget;

  if (reelObserver) {
    reelObserver.disconnect();
  }
  reelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video");
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.6 }
  );
  Array.from(elements.reelTrack.children).forEach((item) => reelObserver.observe(item));
};

const closeReelViewer = () => {
  if (!elements.reelViewer?.open) return;
  elements.reelViewer.close();
  document.body.classList.remove("body--locked");
  Array.from(elements.reelTrack.querySelectorAll("video")).forEach((video) => video.pause());
  if (reelObserver) {
    reelObserver.disconnect();
    reelObserver = null;
  }
};

const setupReelViewer = () => {
  if (!elements.reelViewer || !elements.reelTrack || !elements.reelClose) return;
  elements.reelClose.addEventListener("click", closeReelViewer);
  elements.reelViewer.addEventListener("click", (event) => {
    if (event.target === elements.reelViewer) {
      closeReelViewer();
    }
  });
  elements.reelViewer.addEventListener("close", () => {
    document.body.classList.remove("body--locked");
    Array.from(elements.reelTrack.querySelectorAll("video")).forEach((video) => video.pause());
    if (reelObserver) {
      reelObserver.disconnect();
      reelObserver = null;
    }
  });
  elements.reelTrack.addEventListener(
    "wheel",
    (event) => {
      if (!elements.reelViewer.open) return;
      if (Math.abs(event.deltaY) < 10) return;
      event.preventDefault();
      const current = Math.round(elements.reelTrack.scrollTop / elements.reelTrack.clientHeight);
      const next = event.deltaY > 0 ? current + 1 : current - 1;
      const maxIndex = elements.reelTrack.children.length - 1;
      const clamped = Math.min(Math.max(next, 0), maxIndex);
      elements.reelTrack.scrollTo({ top: clamped * elements.reelTrack.clientHeight, behavior: "smooth" });
    },
    { passive: false }
  );
  document.addEventListener("keydown", (event) => {
    if (!elements.reelViewer.open) return;
    if (event.key === "Escape") {
      closeReelViewer();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const current = Math.round(elements.reelTrack.scrollTop / elements.reelTrack.clientHeight);
      const next = event.key === "ArrowDown" ? current + 1 : current - 1;
      const maxIndex = elements.reelTrack.children.length - 1;
      const clamped = Math.min(Math.max(next, 0), maxIndex);
      elements.reelTrack.scrollTo({ top: clamped * elements.reelTrack.clientHeight, behavior: "smooth" });
    }
  });
};

const openComments = async (postId) => {
  activePostId = postId;
  if (feedFromApi) {
    try {
      const response = await fetchJson(`/api/comments.php?post_id=${postId}`);
      state.comments[postId] = response.items || [];
    } catch (error) {
      state.comments[postId] = state.comments[postId] || [];
    }
  }
  renderComments();
  elements.commentModal.showModal();
};

const renderComments = () => {
  const list = state.comments[activePostId] || [];
  elements.commentList.innerHTML = list
    .map(
      (comment) => `
      <div class="comment-item">
        <strong>${comment.user?.email || comment.name || "Гость"}</strong>
        <p>${comment.body || comment.text}</p>
        <small>${comment.created_at || comment.date || ""}</small>
      </div>
    `
    )
    .join("");
};

let calendarCursor = new Date();

const formatDate = (date) => date.toISOString().split("T")[0];

const renderCalendarDay = () => {
  if (!elements.calendarSlots || !elements.calendarDayTitle) return;
  if (!state.selectedDate) {
    elements.calendarDayTitle.textContent = "Выберите дату";
    elements.calendarSlots.innerHTML = "";
    return;
  }
  elements.calendarDayTitle.textContent = `Слоты на ${state.selectedDate}`;
  const daySlots = slotsData
    .filter((slot) => slot.date === state.selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  if (!daySlots.length) {
    elements.calendarSlots.innerHTML = "<p class=\"hint\">Нет доступных слотов.</p>";
    return;
  }
  const grouped = daySlots.reduce((acc, slot) => {
    const key = slot.route_tag || "all";
    acc[key] = acc[key] || [];
    acc[key].push(slot);
    return acc;
  }, {});

  elements.calendarSlots.innerHTML = "";
  Object.keys(grouped).forEach((route) => {
    const group = document.createElement("div");
    group.className = "slot-group";
    group.innerHTML = `<h4 class="slot-group__title">${routeLabel(route)}</h4>`;
    const groupGrid = document.createElement("div");
    groupGrid.className = "slot-grid";
    grouped[route].forEach((slot) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `slot-card ${slot.is_available ? "" : "is-disabled"}`;
      card.innerHTML = `
        <strong>${slot.time}</strong>
        <p>${routeLabel(route)}</p>
      `;
      if (!slot.is_available) {
        card.disabled = true;
      }
      card.addEventListener("click", () => {
        if (!slot.is_available) return;
        state.selectedSlot = slot.id;
        saveState();
        renderWizardSlots();
      });
      groupGrid.appendChild(card);
    });
    group.appendChild(groupGrid);
    elements.calendarSlots.appendChild(group);
  });
};

const renderCalendar = () => {
  if (!elements.calendarGrid || !elements.calendarMonth) return;
  const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
  elements.calendarMonth.textContent = monthStart.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  elements.calendarGrid.innerHTML = "";
  weekdays.forEach((day) => {
    const label = document.createElement("div");
    label.className = "calendar-weekday";
    label.textContent = day;
    elements.calendarGrid.appendChild(label);
  });
  const offset = (monthStart.getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-cell is-empty";
    elements.calendarGrid.appendChild(empty);
  }
  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const date = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), day);
    const dateString = formatDate(date);
    const dateSlots = slotsData.filter((slot) => slot.date === dateString);
    const availableCount = dateSlots.filter((slot) => slot.is_available).length;
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const meta = availableCount
      ? `${availableCount} слота`
      : dateSlots.length
      ? "занято"
      : "нет слотов";
    cell.innerHTML = `
      <button type="button" data-date="${dateString}">${day}</button>
      <span class="calendar-cell__meta">${meta}</span>
    `;
    cell.querySelector("button").addEventListener("click", () => {
      state.selectedDate = dateString;
      saveState();
      renderCalendarDay();
    });
    elements.calendarGrid.appendChild(cell);
  }
};

const renderWizardRoutes = () => {
  const tags = Array.from(new Set(postsData.map((post) => post.routeTag)));
  elements.routeGrid.innerHTML = "";
  tags.forEach((tag) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `route-card ${state.selectedRoute === tag ? "is-active" : ""}`;
    card.innerHTML = `
      <strong>${tag}</strong>
      <p>${postsData.find((post) => post.routeTag === tag)?.durationLabel || ""}</p>
    `;
    card.addEventListener("click", () => {
      state.selectedRoute = tag;
      saveState();
      loadAvailability().then(() => {
        renderSlots();
        renderWizardSlots();
      });
      renderWizardRoutes();
    });
    elements.routeGrid.appendChild(card);
  });
};

const renderWizardSlots = () => {
  elements.slotGrid.innerHTML = "";
  const filteredSlots = slotsData.filter((slot) => {
    if (!slot.is_available) return false;
    if (!state.selectedRoute) return true;
    return slot.route_tag === "all" || slot.route_tag === state.selectedRoute;
  });
  filteredSlots.forEach((slot) => {
    const card = document.createElement("button");
    card.type = "button";
    const isDisabled = slot.is_available === 0;
    card.className = `slot-card ${state.selectedSlot === slot.id ? "is-active" : ""} ${
      isDisabled ? "is-disabled" : ""
    }`;
    card.innerHTML = `
      <strong>${slot.label || routeLabel(slot.route_tag)}</strong>
      <small class="hint">${routeLabel(slot.route_tag)}</small>
      <p>${slot.date}</p>
      <p>${slot.time || slot.time_slot}</p>
    `;
    card.addEventListener("click", () => {
      if (isDisabled) return;
      state.selectedSlot = slot.id;
      saveState();
      renderWizardSlots();
    });
    if (isDisabled) {
      card.disabled = true;
    }
    elements.slotGrid.appendChild(card);
  });
};

const renderReviews = () => {
  elements.reviewGrid.innerHTML = "";
  const reviewPosts = postsData.filter((post) => post.type === "review");
  const list = reviewPosts.length
    ? reviewPosts.map((post) => ({
        id: post.id,
        author: post.caption.split("—")[0] || "Гость",
        text: post.caption,
        media_kind: post.media_kind,
        telegram_file_id: post.telegram_file_id,
      }))
    : reviews;
  list.forEach((review) => {
    const mediaKind = review.media_kind === "video" || review.media_kind === "telegram_video" ? "video" : "photo";
    const mediaUrl = review.media_url || "";
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="media">
        ${
          mediaUrl && mediaKind === "video"
            ? `<video src="${mediaUrl}" controls preload="metadata"></video>`
            : `<img src="${mediaUrl || ASSETS.review}" alt="Отзыв ${review.author}" loading="lazy" />`
        }
      </div>
      <strong>${review.author}</strong>
      <p>${review.text}</p>
    `;
    const img = card.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.src = ASSETS.review;
      });
    }
    elements.reviewGrid.appendChild(card);
  });
  initReviewCarousel();
};

const initReviewCarousel = () => {
  if (!elements.reviewGrid) return;
  if (!window.jQuery || !window.jQuery.fn?.slick) {
    elements.reviewGrid.classList.add("review-grid--fallback");
    return;
  }
  const $grid = window.jQuery(elements.reviewGrid);
  if ($grid.hasClass("slick-initialized")) {
    $grid.slick("unslick");
  }
  elements.reviewGrid.classList.remove("review-grid--fallback");
  $grid.slick({
    centerMode: true,
    slidesToShow: 3,
    arrows: true,
    dots: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 720,
        settings: { slidesToShow: 1 },
      },
    ],
  });
};

const setActiveChip = (chip) => {
  elements.filterChips.forEach((item) => item.classList.remove("is-active"));
  chip.classList.add("is-active");
};

const setupFilters = () => {
  elements.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter === "all" ? "all" : chip.dataset.filter;
      setActiveChip(chip);
      if (feedFromApi) {
        loadFeedFromApi(true).catch(() => {});
      } else {
        visibleCount = 6;
        renderPosts();
      }
      scrollToFeed();
    });
  });
  setActiveChip(elements.filterChips[0]);
};

const setupSearch = () => {
  elements.feedSearch.addEventListener("input", () => {
    if (feedFromApi) {
      loadFeedFromApi(true).catch(() => {});
    } else {
      visibleCount = 6;
      renderPosts();
    }
  });
  elements.globalSearch.addEventListener("input", () => {
    if (feedFromApi) {
      loadFeedFromApi(true).catch(() => {});
    } else {
      visibleCount = 6;
      renderPosts();
    }
  });
};

const setupSorting = () => {
  elements.sortSelect.addEventListener("change", () => {
    if (feedFromApi) {
      loadFeedFromApi(true).catch(() => {});
    } else {
      renderPosts();
    }
  });
};

const setupShowMore = () => {
  elements.showMore.addEventListener("click", () => {
    if (feedFromApi) {
      loadFeedFromApi(false).catch(() => {});
    } else {
      visibleCount += 4;
      renderPosts();
    }
  });
};

const setupInfiniteScroll = () => {
  feedSentinel = document.createElement("div");
  feedSentinel.dataset.feedSentinel = "true";
  elements.feedGrid.appendChild(feedSentinel);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && feedFromApi) {
        loadFeedFromApi(false).catch(() => {});
      }
    });
  });
  observer.observe(feedSentinel);
};

const setupModals = () => {
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest("dialog").close();
    });
  });

  [elements.openReview, elements.reviewCta].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", () => {
      elements.reviewModal.showModal();
    });
  });
};

const setupComments = () => {
  elements.commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.commentForm);
    const name = formData.get("comment-name").trim();
    const text = formData.get("comment-text").trim();
    if (text.length < 1) return;

    if (!feedFromApi) {
      if (name.length < 2 || text.length < 2) return;
      const list = state.comments[activePostId] || [];
      list.push({ name, text, date: new Date().toLocaleDateString("ru-RU") });
      state.comments[activePostId] = list;
      saveState();
      elements.commentForm.reset();
      renderComments();
      renderPosts();
      return;
    }

    try {
      const payload = { post_id: activePostId, body: text };
      const response = await fetchJson("/api/comments.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const list = state.comments[activePostId] || [];
      if (response.comment) {
        list.unshift(response.comment);
      }
      state.comments[activePostId] = list;
      const post = postsData.find((item) => item.id === activePostId);
      if (post) {
        post.comments_count = (post.comments_count || 0) + 1;
      }
      elements.commentForm.reset();
      renderComments();
      renderPosts();
    } catch (error) {
      alert(error.message || "Нужна авторизация для комментариев.");
    }
  });
};

const setupThemeToggle = () => {
  elements.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  });
};

const setupMenuToggle = () => {
  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const closeMenu = () => {
    elements.mobileMenu.classList.remove("is-open");
    elements.menuOverlay.classList.remove("is-open");
    document.body.classList.remove("body--locked");
    elements.menuToggle.setAttribute("aria-expanded", "false");
    if (lastFocused) lastFocused.focus();
  };

  const openMenu = () => {
    lastFocused = document.activeElement;
    elements.mobileMenu.classList.add("is-open");
    elements.menuOverlay.classList.add("is-open");
    document.body.classList.add("body--locked");
    elements.menuToggle.setAttribute("aria-expanded", "true");
    const focusable = elements.mobileMenu.querySelectorAll(focusableSelectors);
    if (focusable.length) focusable[0].focus();
  };

  const toggleMenu = () => {
    const isOpen = elements.mobileMenu.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  elements.menuToggle.addEventListener("click", toggleMenu);
  elements.menuClose?.addEventListener("click", closeMenu);
  elements.menuOverlay?.addEventListener("click", closeMenu);

  elements.mobileMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
    if (event.key === "Tab" && elements.mobileMenu.classList.contains("is-open")) {
      const focusable = Array.from(elements.mobileMenu.querySelectorAll(focusableSelectors));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
};

const setupFavorites = () => {
  if (!elements.favoritesOpen || !elements.favoritesModal) return;
  elements.favoritesOpen.addEventListener("click", () => {
    elements.mobileMenu.classList.remove("is-open");
    elements.menuOverlay.classList.remove("is-open");
    document.body.classList.remove("body--locked");
    elements.menuToggle.setAttribute("aria-expanded", "false");
    renderFavorites();
    elements.favoritesModal.showModal();
  });
};

const setupCalendarNavigation = () => {
  if (!elements.calendarPrev || !elements.calendarNext) return;
  elements.calendarPrev.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar();
    renderCalendarDay();
  });
  elements.calendarNext.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar();
    renderCalendarDay();
  });
};

const setupWizard = () => {
  const panels = document.querySelectorAll("[data-step-panel]");
  const indicators = document.querySelectorAll(".step-indicator");

  const showStep = (step) => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.stepPanel !== step;
    });
    indicators.forEach((indicator) => {
      indicator.classList.toggle("is-active", indicator.dataset.step === step);
    });
  };

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = button.closest(".wizard__panel").dataset.stepPanel;
      const nextStep = String(Number(current) + 1);
      showStep(nextStep);
    });
  });

  document.querySelectorAll("[data-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = button.closest(".wizard__panel").dataset.stepPanel;
      const prevStep = String(Number(current) - 1);
      showStep(prevStep);
    });
  });

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => showStep(indicator.dataset.step));
  });

  showStep("1");
};

const phoneMask = (input) => {
  const digits = input.value.replace(/\D/g, "").slice(0, 11);
  const formatted = [
    "+7",
    digits.slice(1, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ];
  input.value = `${formatted[0]} (${formatted[1] || ""}${formatted[1] ? ")" : ""} ${formatted[2] || ""}${
    formatted[2] ? "-" : ""
  }${formatted[3] || ""}${formatted[3] ? "-" : ""}${formatted[4] || ""}`.trim();
};

const validateForm = (formData) => {
  const errors = {};
  const name = formData.get("name").trim();
  const phone = formData.get("phone").trim();
  if (name.length < 2) errors.name = "Введите минимум 2 символа.";
  if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) {
    errors.phone = "Введите телефон в формате +7 (___) ___-__-__.";
  }
  if (!state.selectedRoute) errors.route = "Выберите маршрут.";
  if (!state.selectedSlot) errors.slot = "Выберите дату и время.";
  return errors;
};

const showErrors = (errors) => {
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = errors[el.dataset.errorFor] || "";
  });
  if (errors.route || errors.slot) {
    elements.formAlert.textContent = [errors.route, errors.slot].filter(Boolean).join(" ");
    elements.formAlert.hidden = false;
  } else {
    elements.formAlert.hidden = true;
  }
};

const sendLead = async (payload) => {
  const response = await fetch("/api/lead-send.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
};

const setupForm = () => {
  const phoneInput = elements.bookingForm.querySelector("input[name='phone']");
  phoneInput.addEventListener("input", () => phoneMask(phoneInput));

  elements.bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.bookingForm);
    const errors = validateForm(formData);
    showErrors(errors);
    if (Object.keys(errors).length) return;

    elements.telegramStatus.textContent = "Отправка...";
    try {
      const slot = slotsData.find((item) => item.id === state.selectedSlot);
      const success = await sendLead({
        route: state.selectedRoute,
        date: slot?.date || "",
        time: slot?.time || "",
        name: formData.get("name"),
        phone: formData.get("phone"),
        peopleCount: formData.get("people"),
        level: formData.get("level"),
        comment: formData.get("comment") || "",
        source: "Сайт (my-first-site2)",
      });
      if (success) {
        elements.telegramStatus.textContent = "Успешно отправлено!";
        elements.bookingForm.reset();
      } else {
        throw new Error("Ошибка отправки");
      }
    } catch (error) {
      elements.telegramStatus.innerHTML =
        "Ошибка отправки. <a href='https://t.me/' target='_blank' rel='noopener'>Открыть в Telegram</a>";
    }
  });
};

const setupReviewForm = () => {
  elements.reviewFiles.addEventListener("change", () => {
    const files = Array.from(elements.reviewFiles.files || []);
    elements.reviewPreview.innerHTML = files
      .map(
        (file) => `
        <div class="file-preview__item">
          <div>${file.name}</div>
          <span>${Math.round(file.size / 1024)} KB</span>
        </div>
      `
      )
      .join("");
  });

  elements.reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.reviewForm);
    const text = formData.get("review-text").trim();
    if (text.length < 10) {
      elements.reviewAlert.textContent = "Отзыв должен быть минимум 10 символов.";
      elements.reviewAlert.hidden = false;
      return;
    }
    elements.reviewAlert.hidden = true;
    const files = Array.from(elements.reviewFiles.files || []);
    if (files.length > 5) {
      elements.reviewAlert.textContent = "Можно загрузить не более 5 файлов.";
      elements.reviewAlert.hidden = false;
      return;
    }
    const payload = new FormData();
    payload.append("name", formData.get("review-name"));
    payload.append("rating", formData.get("review-rating"));
    payload.append("text", text);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        payload.append("photos", file);
      } else if (file.type.startsWith("video/")) {
        payload.append("videos", file);
      }
    });
    elements.reviewStatus.textContent = "Отправка...";
    try {
      await fetchJson("/api/review-submit.php", { method: "POST", body: payload });
      elements.reviewStatus.textContent = "Спасибо! Отзыв отправлен.";
      elements.reviewForm.reset();
      elements.reviewPreview.innerHTML = "";
    } catch (error) {
      elements.reviewStatus.textContent = `Ошибка: ${error.message}`;
    }
  });
};

const loadStoriesFromApi = async () => {
  const response = await fetchJson("/api/stories.php?limit=20");
  storiesData = response.items || storiesData;
};

const loadFeedFromApi = async (reset = false) => {
  if (feedLoading || (!feedHasMore && !reset)) return;
  feedLoading = true;
  try {
    if (reset) {
      feedCursor = null;
      feedHasMore = true;
      postsData = [];
    }
    const params = new URLSearchParams();
    params.set("limit", "6");
    const query = elements.feedSearch.value.trim() || elements.globalSearch.value.trim();
    if (query) params.set("q", query);
    if (activeFilter !== "all") params.set("tag", activeFilter);
    params.set("sort", elements.sortSelect.value || "new");
    if (feedCursor) params.set("cursor", feedCursor);

    const response = await fetchJson(`/api/feed.php?${params.toString()}`);
    const items = (response.items || []).map(normalizePost);
    postsData = reset ? items : [...postsData, ...items];
    feedCursor = response.next_cursor || null;
    feedHasMore = Boolean(feedCursor);
    feedFromApi = true;
    elements.feedStatus.textContent = "";
    renderPosts();
  } finally {
    feedLoading = false;
  }
};

const loadPublicData = async () => {
  try {
    await loadFeedFromApi(true);
  } catch (error) {
    feedFromApi = false;
    elements.feedStatus.textContent = "Показываем демо-ленту: сервер недоступен.";
    postsData = posts.map(normalizePost);
    renderPosts();
  }

  try {
    await loadStoriesFromApi();
  } catch (error) {
    // fallback
  }

  await loadAvailability();
};

const loadAvailability = async () => {
  try {
    const availabilityResponse = await fetchJson("/api/admin-availability.php?public=1");
    slotsData = (availabilityResponse.slots || slotsData).map(normalizeSlot);
    if (!state.selectedDate && slotsData.length) {
      const today = formatDate(new Date());
      const dates = Array.from(new Set(slotsData.map((slot) => slot.date))).sort();
      state.selectedDate = dates.includes(today) ? today : dates[0];
      saveState();
    }
    if (state.selectedDate) {
      const selected = new Date(state.selectedDate);
      if (!Number.isNaN(selected.getTime())) {
        calendarCursor = new Date(selected.getFullYear(), selected.getMonth(), 1);
      }
    }
  } catch (error) {
    // fallback
  }
};

const init = async () => {
  loadState();
  applyTheme();
  applyTopbarState();
  await loadPublicData();
  renderStories();
  renderCalendar();
  renderCalendarDay();
  renderWizardRoutes();
  renderWizardSlots();
  renderReviews();
  setupFilters();
  setupSearch();
  setupSorting();
  setupShowMore();
  setupInfiniteScroll();
  setupModals();
  setupComments();
  setupThemeToggle();
  setupMenuToggle();
  setupFavorites();
  setupReelViewer();
  setupCalendarNavigation();
  setupWizard();
  setupForm();
  setupReviewForm();
  renderPosts();
  window.addEventListener("scroll", applyTopbarState, { passive: true });
};

init();
