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

const TOPBAR_COMPACT_ON = 96;
const TOPBAR_COMPACT_OFF = 64;
const TOPBAR_LOCK_MS = 260;
let topbarCompact = false;
let topbarRaf = null;
let topbarTransitioning = false;
let topbarPending = null;
let topbarUnlockTimer = null;
let storiesSwipeBound = false;
const REELS_MAX_ITEMS = 24;
const REELS_WINDOW = 1;
const REELS_AUTO_KEY = "reelsAutoOpened";
const REELS_MOBILE_MAX = 768;
const REELS_VISIBILITY = 0.6;
const REELS_LOAD_TIMEOUT = 8000;
const REELS_DEBUG = Boolean(window.__DEV__) || new URLSearchParams(window.location.search).get("debug") === "1";
let reelsActiveIndex = 0;
let reelsMuted = true;
let reelsPosts = [];
let reelsOverlay = null;
let reelsTrack = null;
let reelsObserver = null;
let reelsAutoObserver = null;
let reelsScrollY = 0;
let reelsHistoryActive = false;
let reelsClosing = false;
const reelsMediaTimeouts = new Map();

const reelsLog = (event, data = {}) => {
  if (!REELS_DEBUG) return;
  try {
    console.log("[reels]", event, data);
  } catch (error) {
    // Ignore logging errors.
  }
};

let activeFilter = "all";
let visibleCount = 6;
let activePostId = null;
let postsData = [...posts];
let storiesData = [...stories];
let slotsData = [...slots];
let reviewsData = [...reviews];
let feedCursor = null;
let feedHasMore = true;
let feedLoading = false;
let feedFromApi = false;
let feedSentinel = null;

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

const releaseTopbarLock = () => {
  if (!topbarTransitioning) return;
  topbarTransitioning = false;
  if (topbarPending !== null && topbarPending !== topbarCompact) {
    const pending = topbarPending;
    topbarPending = null;
    setTopbarCompact(pending);
  }
};

const setTopbarCompact = (nextState) => {
  if (!elements.topbar) return;
  if (topbarCompact === nextState) return;
  topbarCompact = nextState;
  topbarTransitioning = true;
  elements.topbar.classList.toggle("topbar--compact", topbarCompact);
  if (topbarUnlockTimer) {
    window.clearTimeout(topbarUnlockTimer);
  }
  topbarUnlockTimer = window.setTimeout(releaseTopbarLock, TOPBAR_LOCK_MS);
};

const applyTopbarState = () => {
  if (!elements.topbar) return;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const shouldCompact = topbarCompact ? scrollY > TOPBAR_COMPACT_OFF : scrollY > TOPBAR_COMPACT_ON;
  if (topbarTransitioning) {
    topbarPending = shouldCompact;
    return;
  }
  setTopbarCompact(shouldCompact);
};

const scheduleTopbarUpdate = () => {
  if (topbarRaf) return;
  topbarRaf = window.requestAnimationFrame(() => {
    topbarRaf = null;
    applyTopbarState();
  });
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

const parseDate = (value) => {
  if (!value) return null;
  const parts = String(value).split("-").map((item) => Number(item));
  if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
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
  is_available: Number(slot.is_available) ? 1 : 0,
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

const destroyStoriesCarousel = () => {
  if (!elements.storiesList) return;
  if (!window.jQuery || !window.jQuery.fn?.slick) return;
  const $list = window.jQuery(elements.storiesList);
  if ($list.hasClass("slick-initialized")) {
    $list.slick("unslick");
  }
};

const buildMediaThumbUrl = (url, size = 256) => {
  if (!url) return "";
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}thumb=${size}`;
};

const resolveStoryMedia = (story) => {
  if (Array.isArray(story?.media) && story.media.length) {
    return story.media.map((media) => ({
      media_url: media.media_url || "",
      media_type: media.media_type || "",
      thumb_url: media.thumb_url || media.poster_url || "",
    }));
  }
  const mediaUrl = story.media_url || story.mediaUrl || "";
  if (!mediaUrl) return [];
  const mediaType =
    story.media_kind === "video" || story.media_kind === "telegram_video" || story.media_type === "video"
      ? "video"
      : "image";
  return [
    {
      media_url: mediaUrl,
      media_type: mediaType,
      thumb_url: buildMediaThumbUrl(mediaUrl),
    },
  ];
};

const renderStories = () => {
  destroyStoriesCarousel();
  elements.storiesList.classList.add("stories__list--fallback", "stories__list--strip");
  elements.storiesList.innerHTML = "";
  const thumbUrls = [];
  storiesData.forEach((story, index) => {
    const title = story.title || "Воспоминание";
    const subtitle = story.subtitle || story.text || "Новая история";
    const mediaList = resolveStoryMedia(story);
    const first = mediaList[0];
    const mediaUrl = first?.media_url || "";
    const mediaKind = first?.media_type === "video" ? "video" : "photo";
    const poster = first?.thumb_url || story.poster_url || story.poster || story.thumbnail_url || "";
    const fallbackImage = ASSETS.story;
    const isVideo = mediaKind === "video";
    const thumbSrc = isVideo ? poster || buildMediaThumbUrl(mediaUrl) : buildMediaThumbUrl(mediaUrl) || poster;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "story-thumb stories__item";
    card.dataset.storyId = story.id;
    card.dataset.mediaType = isVideo ? "video" : "image";
    card.dataset.mediaSrc = mediaUrl;
    card.dataset.mediaUrl = mediaUrl;
    card.dataset.poster = poster;
    card.dataset.posterUrl = poster;
    card.dataset.title = title;
    card.dataset.subtitle = subtitle;
    card.dataset.caption = subtitle;
    card.dataset.media = JSON.stringify(mediaList);
    card.innerHTML = `
      <span class="story-thumb__media">
        ${
          thumbSrc
            ? `<img src="${thumbSrc}" alt="Воспоминание ${title}" loading="lazy" />`
            : `<span class="story-thumb__placeholder" aria-hidden="true"></span>`
        }
      </span>
      <span class="story-thumb__caption">${title}</span>
    `;
    elements.storiesList.appendChild(card);
    if (thumbSrc) {
      thumbUrls.push(thumbSrc);
      const img = card.querySelector("img");
      if (img && index < 12) {
        img.loading = "eager";
        img.fetchPriority = "high";
      }
    }
  });
  initStoriesCarousel();
  thumbUrls.slice(0, 35).forEach((url) => {
    const prefetch = new Image();
    prefetch.src = url;
  });
};

const setupStoryMediaPreviews = () => {
  if (!elements.storiesList) return;
  const videos = elements.storiesList.querySelectorAll(".story-card__media video");
  videos.forEach((video) => {
    const wrapper = video.closest(".story-card__media");
    if (!wrapper || video.poster) return;
    const captureFrame = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      if (wrapper.dataset.previewReady === "true") return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        wrapper.style.backgroundImage = `url("${dataUrl}")`;
        wrapper.classList.add("story-card__media--frame");
        wrapper.dataset.previewReady = "true";
      } catch (error) {
        // Keep video element as-is if capture fails.
      }
    };

    const seekForFrame = () => {
      try {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Math.min(0.01, video.duration / 10);
        } else {
          video.currentTime = 0.01;
        }
      } catch (error) {
        // Ignore seek errors.
      }
    };

    const tryCapture = () => {
      if (video.readyState >= 2) {
        captureFrame();
        return;
      }
      if (video.readyState >= 1) {
        seekForFrame();
      }
    };

    video.addEventListener("loadedmetadata", seekForFrame, { once: true });
    video.addEventListener("seeked", captureFrame, { once: true });
    video.addEventListener("loadeddata", tryCapture, { once: true });
    tryCapture();
  });
};

const openStory = (story) => {
  const mediaList = resolveStoryMedia(story);
  const first = mediaList[0];
  const mediaUrl = first?.media_url || "";
  const mediaKind = first?.media_type === "video" ? "video" : "photo";
  const hasMedia = Boolean(mediaUrl);
  const poster = first?.thumb_url || story.poster_url || story.poster || story.thumbnail_url || "";
  const posterAttr = poster ? ' poster="' + poster + '"' : "";
  elements.storyContent.innerHTML = `
    <h3>${story.title}</h3>
    <p>${story.subtitle || story.text || ""}</p>
    <div class="story-content__media">
      ${
        hasMedia && mediaKind === "video"
          ? `<video src="${mediaUrl}"${posterAttr} controls playsinline preload="metadata"></video>`
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
  openDialog(elements.storyModal);
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
  setupReelsAutoOpen();
};

const createPostCard = (post) => {
  const card = document.createElement("article");
  card.className = "post-card";
  card.id = `post-${post.id}`;
  card.dataset.postId = post.id;
  const liked = feedFromApi ? Boolean(post.is_favorited) : Boolean(state.likes[post.id]);
  const saved = Boolean(state.saves[post.id]);
  const commentsCount = feedFromApi ? post.comments_count || 0 : (state.comments[post.id] || []).length;
  const mediaKind = post.media_kind === "video" || post.media_kind === "telegram_video" ? "video" : "photo";
  const mediaUrl = post.media_url || "";
  const posterUrl = post.poster_url || post.poster || post.thumbnail_url || "";
  card.dataset.mediaUrl = mediaUrl;
  card.dataset.mediaType = mediaKind;
  card.dataset.posterUrl = posterUrl;
  card.dataset.caption = post.caption || "";
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
  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a, input, textarea, select, [data-action]")) return;
    openReels(post.id, "click");
  });

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

const setVideoSource = (video, source) => {
  if (!video) return;
  if (video.getAttribute("data-src") === source && video.getAttribute("src")) return;
  video.setAttribute("data-src", source);
  video.setAttribute("src", source);
  video.load();
};

const clearVideoSource = (video) => {
  if (!video) return;
  if (!video.getAttribute("src")) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
};

const buildItemsFromFeedDOM = () => {
  const cards = Array.from(elements.feedGrid?.querySelectorAll(".post-card") || []);
  const items = cards
    .map((card) => {
      const postId = card.dataset.postId;
      const post = postsData.find((entry) => String(entry.id) === String(postId)) || {};
      const mediaUrl = card.dataset.mediaUrl || post.media_url || "";
      const mediaType = card.dataset.mediaType || post.media_kind || (post.type === "reel" ? "video" : "photo");
      const posterUrl = card.dataset.posterUrl || post.poster_url || post.poster || post.thumbnail_url || "";
      const caption = card.dataset.caption || post.caption || "";
      return {
        ...post,
        id: post.id || postId,
        media_url: mediaUrl,
        media_kind: mediaType,
        poster_url: posterUrl,
        caption,
      };
    })
    .filter((item) => item && (item.media_url || item.poster_url));
  return items.length ? items : filteredPosts();
};

const getBookingTarget = () => "#funnel";

const createReelsOverlay = () => {
  if (reelsOverlay) return;
  reelsOverlay = document.createElement("div");
  reelsOverlay.className = "reels-overlay";
  reelsOverlay.setAttribute("role", "dialog");
  reelsOverlay.setAttribute("aria-modal", "true");
  reelsOverlay.setAttribute("aria-hidden", "true");
  reelsOverlay.innerHTML = `
    <div class="reels-overlay__backdrop" data-reels-close></div>
    <div class="reels-overlay__panel">
      <button class="reels-overlay__back" type="button" data-reels-back>Назад</button>
      <button class="reels-overlay__close" type="button" data-reels-close aria-label="Закрыть">✕</button>
      <div class="reels-overlay__track" tabindex="0"></div>
      <button class="reels-overlay__nav reels-overlay__nav--prev" type="button" aria-label="Предыдущий ролик">↑</button>
      <button class="reels-overlay__nav reels-overlay__nav--next" type="button" aria-label="Следующий ролик">↓</button>
    </div>
  `;
  document.body.appendChild(reelsOverlay);
  reelsTrack = reelsOverlay.querySelector(".reels-overlay__track");
  reelsOverlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-reels-close]")) {
      closeReels();
    }
    if (event.target.closest("[data-reels-back]")) {
      closeReels();
    }
  });
  reelsOverlay.querySelector(".reels-overlay__nav--prev")?.addEventListener("click", () => scrollReelsBy(-1));
  reelsOverlay.querySelector(".reels-overlay__nav--next")?.addEventListener("click", () => scrollReelsBy(1));

  reelsTrack.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-reels-action]");
    if (!actionButton) return;
    const item = actionButton.closest(".reels-overlay__item");
    if (!item) return;
    const post = reelsPosts.find((entry) => String(entry.id) === String(item.dataset.postId));
    if (!post) return;
    const action = actionButton.dataset.reelsAction;
    if (action === "comment") {
      openComments(post.id);
      return;
    }
    if (action === "share") {
      handlePostAction(post, "share");
      return;
    }
    if (action === "like" || action === "save") {
      handlePostAction(post, action);
      updateReelsButtons();
      return;
    }
  });

  reelsTrack.addEventListener("click", (event) => {
    const muteBtn = event.target.closest(".reels-overlay__mute");
    if (!muteBtn) return;
    reelsMuted = !reelsMuted;
    reelsTrack.querySelectorAll(".reels-overlay__mute").forEach((button) => {
      button.textContent = reelsMuted ? "🔇" : "🔊";
    });
    reelsTrack.querySelectorAll("video").forEach((video) => {
      video.muted = reelsMuted;
    });
  });

  reelsTrack.addEventListener("click", (event) => {
    const bookBtn = event.target.closest(".reels-overlay__book");
    if (!bookBtn) return;
    const target = getBookingTarget();
    closeReels({ bookingTarget: target });
  });

  document.addEventListener("keydown", (event) => {
    if (!reelsOverlay?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeReels();
    }
    if (event.key === "ArrowDown") {
      scrollReelsBy(1);
    }
    if (event.key === "ArrowUp") {
      scrollReelsBy(-1);
    }
  });

  window.addEventListener("popstate", (event) => {
    if (!reelsOverlay?.classList.contains("is-open")) return;
    if (event.state?.reels) return;
    closeReels({ fromPopState: true });
  });
};

const clearReelsTimeout = (mediaEl) => {
  const current = reelsMediaTimeouts.get(mediaEl);
  if (current) {
    clearTimeout(current);
    reelsMediaTimeouts.delete(mediaEl);
  }
};

const setReelsTimeout = (mediaEl, onTimeout) => {
  clearReelsTimeout(mediaEl);
  const timer = setTimeout(onTimeout, REELS_LOAD_TIMEOUT);
  reelsMediaTimeouts.set(mediaEl, timer);
};

const showReelsFallback = (mediaEl, post, mediaKind, reason, retry) => {
  const fallback = post.type === "reel" ? ASSETS.reel : ASSETS.photo;
  const poster = post.poster_url || post.poster || post.thumbnail_url || fallback;
  mediaEl.innerHTML = `
    <div class="reels-overlay__fallback">
      <img src="${poster}" alt="${post.caption || "Медиа"}" loading="lazy" />
      <div class="reels-overlay__status">Не удалось загрузить</div>
      <button class="reels-overlay__retry" type="button">Повторить</button>
    </div>
  `;
  reelsLog("fallback", { postId: post.id, mediaKind, reason });
  const retryButton = mediaEl.querySelector(".reels-overlay__retry");
  retryButton?.addEventListener("click", () => retry(mediaEl));
};

const renderReelsMedia = (mediaEl, post, shouldLoad, isActive) => {
  const mediaUrl = post.media_url || "";
  const mediaKind =
    post.media_kind === "video" || post.media_kind === "telegram_video" || post.type === "reel" ? "video" : "photo";
  const poster = post.poster_url || post.poster || post.thumbnail_url || "";
  const fallback = post.type === "reel" ? ASSETS.reel : ASSETS.photo;
  const targetSrc = mediaKind === "photo" ? mediaUrl || fallback : mediaUrl;
  const targetPoster = poster || fallback;

  if (!shouldLoad) {
    mediaEl.dataset.loaded = "0";
    mediaEl.dataset.src = targetPoster;
    mediaEl.dataset.kind = mediaKind;
    mediaEl.innerHTML = `<img src="${targetPoster}" alt="${post.caption || "Медиа"}" loading="lazy" />`;
    return;
  }

  if (mediaEl.dataset.loaded === "1" && mediaEl.dataset.src === targetSrc && mediaEl.dataset.kind === mediaKind) {
    return;
  }

  clearReelsTimeout(mediaEl);
  mediaEl.dataset.loaded = "0";
  mediaEl.dataset.src = targetSrc;
  mediaEl.dataset.kind = mediaKind;

  mediaEl.innerHTML = `
    <div class="reels-overlay__spinner" aria-hidden="true"></div>
  `;

  const handleTimeout = () => {
    showReelsFallback(mediaEl, post, mediaKind, "timeout", (el) => {
      const bust = `v=${Date.now()}`;
      if (mediaKind === "photo") {
        const retryUrl = targetSrc ? `${targetSrc}${targetSrc.includes("?") ? "&" : "?"}${bust}` : targetPoster;
        loadReelsImage(el, post, retryUrl, true);
      } else {
        const retryUrl = mediaUrl ? `${mediaUrl}${mediaUrl.includes("?") ? "&" : "?"}${bust}` : "";
        loadReelsVideo(el, post, retryUrl, true);
      }
    });
  };

  setReelsTimeout(mediaEl, handleTimeout);

  const loadReelsImage = (el, postData, src, eager) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    img.alt = postData.caption || "Фото";
    img.onload = () => {
      clearReelsTimeout(el);
      el.dataset.loaded = "1";
      el.innerHTML = "";
      el.appendChild(img);
      reelsLog("image:loaded", { postId: postData.id, src });
    };
    img.onerror = () => {
      clearReelsTimeout(el);
      showReelsFallback(el, postData, "photo", "error", (target) => loadReelsImage(target, postData, src, true));
    };
    img.src = src || targetPoster;
  };

  const loadReelsVideo = (el, postData, src, eager) => {
    if (!src) {
      clearReelsTimeout(el);
      showReelsFallback(el, postData, "video", "no-src", (target) => loadReelsVideo(target, postData, src, true));
      return;
    }
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = reelsMuted;
    video.preload = eager ? "metadata" : "none";
    if (targetPoster) video.poster = targetPoster;
    el.appendChild(video);
    video.addEventListener("loadeddata", () => {
      clearReelsTimeout(el);
      el.dataset.loaded = "1";
      const spinner = el.querySelector(".reels-overlay__spinner");
      if (spinner) spinner.remove();
      reelsLog("video:loaded", { postId: postData.id, src });
      if (isActive) {
        video.play().catch((error) => {
          reelsLog("video:play-blocked", { postId: postData.id, error: error?.message });
        });
      }
    });
    video.addEventListener("error", () => {
      clearReelsTimeout(el);
      showReelsFallback(el, postData, "video", "error", (target) => loadReelsVideo(target, postData, src, true));
    });
    setVideoSource(video, src);
    video.load();
  };

  if (mediaKind === "photo") {
    if (!targetSrc) {
      showReelsFallback(mediaEl, post, mediaKind, "no-src", (target) => loadReelsImage(target, post, targetPoster, true));
      return;
    }
    loadReelsImage(mediaEl, post, targetSrc, isActive);
    return;
  }

  loadReelsVideo(mediaEl, post, mediaUrl, isActive);
};

const updateReelsWindow = () => {
  if (!reelsTrack) return;
  const items = Array.from(reelsTrack.querySelectorAll(".reels-overlay__item"));
  items.forEach((item) => {
    const index = Number(item.dataset.index);
    const postId = item.dataset.postId;
    const post = reelsPosts.find((entry) => String(entry.id) === String(postId));
    if (!post) return;
    const media = item.querySelector(".reels-overlay__media");
    if (!media) return;
    const shouldLoad = Math.abs(index - reelsActiveIndex) <= REELS_WINDOW;
    renderReelsMedia(media, post, shouldLoad, index === reelsActiveIndex);
  });
};

const updateReelsButtons = () => {
  if (!reelsTrack) return;
  const active = reelsPosts[reelsActiveIndex];
  if (!active) return;
  const item = reelsTrack.querySelector(`[data-post-id="${active.id}"]`);
  if (!item) return;
  item.querySelectorAll("[data-reels-action]").forEach((button) => {
    const action = button.dataset.reelsAction;
    if (action === "like") {
      button.classList.toggle("is-active", Boolean(active.is_favorited));
    }
    if (action === "save") {
      button.classList.toggle("is-active", Boolean(state.saves[active.id]));
    }
  });
};

const setActiveReelsIndex = (index) => {
  reelsActiveIndex = Math.max(0, Math.min(index, reelsPosts.length - 1));
  updateReelsWindow();
  const items = Array.from(reelsTrack.querySelectorAll(".reels-overlay__item"));
  items.forEach((item) => {
    const video = item.querySelector("video");
    if (!video) return;
    const itemIndex = Number(item.dataset.index);
    if (itemIndex === reelsActiveIndex) {
      video.muted = reelsMuted;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  updateReelsButtons();
};

const scrollReelsBy = (direction) => {
  if (!reelsTrack) return;
  const next = Math.max(0, Math.min(reelsActiveIndex + direction, reelsPosts.length - 1));
  reelsTrack.scrollTo({ top: next * reelsTrack.clientHeight, behavior: "smooth" });
};

const buildReelsItems = () => {
  if (!reelsTrack) return;
  reelsTrack.innerHTML = "";
  reelsPosts.forEach((post, index) => {
    const item = document.createElement("section");
    item.className = "reels-overlay__item";
    item.dataset.index = String(index);
    item.dataset.postId = post.id;
    const author = post.author || post.user_name || post.owner || "Конная кавалерия";
    const caption = post.caption || post.text || "";
    const hashtags = post.hashtags && post.hashtags.length ? post.hashtags.join(" ") : "";
    item.innerHTML = `
      <div class="reels-overlay__card">
        <div class="reels-overlay__media"></div>
        <button class="reels-overlay__mute" type="button" aria-label="Звук">${reelsMuted ? "🔇" : "🔊"}</button>
        <div class="reels-overlay__actions">
          <button class="reels-overlay__action" data-reels-action="like" type="button" aria-label="Лайк">♡</button>
          <button class="reels-overlay__action" data-reels-action="comment" type="button" aria-label="Комментарий">💬</button>
          <button class="reels-overlay__action" data-reels-action="share" type="button" aria-label="Поделиться">↗</button>
          <button class="reels-overlay__action" data-reels-action="save" type="button" aria-label="Сохранить">★</button>
        </div>
        <div class="reels-overlay__meta">
          <strong>${author}</strong>
          <p>${caption}</p>
          ${hashtags ? `<span class="reels-overlay__tags">${hashtags}</span>` : ""}
          <button class="reels-overlay__book" type="button">Записаться</button>
        </div>
      </div>
    `;
    reelsTrack.appendChild(item);
  });
};

const openReels = (postId, reason = "click") => {
  createReelsOverlay();
  const allItems = buildItemsFromFeedDOM();
  if (!allItems.length) return;
  let startIndex = Math.max(
    0,
    allItems.findIndex((post) => String(post.id) === String(postId))
  );
  let start = 0;
  if (allItems.length > REELS_MAX_ITEMS) {
    const half = Math.floor(REELS_MAX_ITEMS / 2);
    start = Math.max(0, startIndex - half);
    if (start + REELS_MAX_ITEMS > allItems.length) {
      start = Math.max(0, allItems.length - REELS_MAX_ITEMS);
    }
  }
  reelsPosts = allItems.slice(start, start + REELS_MAX_ITEMS);
  if (!reelsPosts.length) return;
  startIndex = Math.max(
    0,
    reelsPosts.findIndex((post) => String(post.id) === String(postId))
  );
  reelsLog("open", { postId, startIndex, count: reelsPosts.length, reason });
  buildReelsItems();
  reelsScrollY = window.scrollY;
  reelsOverlay.classList.add("is-open");
  reelsOverlay.removeAttribute("aria-hidden");
  document.body.classList.add("body--locked");
  requestAnimationFrame(() => {
    reelsTrack.scrollTop = reelsTrack.clientHeight * startIndex;
    setActiveReelsIndex(startIndex);
  });

  if (reelsObserver) {
    reelsObserver.disconnect();
  }
  reelsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.index);
        if (Number.isFinite(index)) {
          setActiveReelsIndex(index);
        }
      });
    },
    { root: reelsTrack, threshold: REELS_VISIBILITY }
  );
  reelsTrack.querySelectorAll(".reels-overlay__item").forEach((item) => reelsObserver.observe(item));

  reelsHistoryActive = true;
  if (!history.state?.reels) {
    history.pushState({ reels: true, postId, reason }, "");
  }
  if (reason === "auto") {
    sessionStorage.setItem(REELS_AUTO_KEY, "1");
  }
};

const closeReels = ({ fromPopState = false, bookingTarget = null } = {}) => {
  if (!reelsOverlay || !reelsOverlay.classList.contains("is-open")) return;
  if (reelsClosing) return;
  reelsClosing = true;
  reelsOverlay.classList.remove("is-open");
  reelsOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body--locked");
  window.scrollTo({ top: reelsScrollY, behavior: "auto" });
  reelsTrack?.querySelectorAll("video").forEach((video) => video.pause());
  if (reelsObserver) {
    reelsObserver.disconnect();
    reelsObserver = null;
  }
  if (!fromPopState && reelsHistoryActive && history.state?.reels) {
    history.back();
  }
  reelsHistoryActive = false;
  reelsClosing = false;
  if (bookingTarget) {
    requestAnimationFrame(() => {
      const target = document.querySelector(bookingTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = bookingTarget;
      }
    });
  }
};

const setupReelsAutoOpen = () => {
  if (window.matchMedia(`(min-width: ${REELS_MOBILE_MAX + 1}px)`).matches) return;
  if (sessionStorage.getItem(REELS_AUTO_KEY)) return;
  if (!elements.feedGrid) return;
  const firstCard = elements.feedGrid.querySelector(".post-card");
  if (!firstCard) return;
  if (reelsAutoObserver) reelsAutoObserver.disconnect();
  reelsAutoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const postId = entry.target.dataset.postId;
        if (!postId) return;
        openReels(postId, "auto");
        reelsAutoObserver?.disconnect();
      });
    },
    { threshold: REELS_VISIBILITY }
  );
  reelsAutoObserver.observe(firstCard);
};

const setupReelsOverlay = () => {
  createReelsOverlay();
  setupReelsAutoOpen();
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
  openDialog(elements.commentModal);
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

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: formatDate(start), to: formatDate(end) };
};

const mergeSlots = (incoming) => {
  const map = new Map(slotsData.map((slot) => [slot.id, slot]));
  incoming.forEach((slot) => {
    map.set(slot.id, slot);
  });
  slotsData = Array.from(map.values());
};

const syncSelectedSlot = () => {
  if (!state.selectedSlot) return;
  const selected = slotsData.find((slot) => slot.id === state.selectedSlot);
  if (!selected) {
    state.selectedSlot = null;
    return;
  }
  if (state.selectedDate && selected.date !== state.selectedDate) {
    state.selectedSlot = null;
  }
  if (state.selectedRoute && selected.route_tag !== "all" && selected.route_tag !== state.selectedRoute) {
    state.selectedSlot = null;
  }
};

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
        if (slot.route_tag && slot.route_tag !== "all") {
          state.selectedRoute = slot.route_tag;
        }
        saveState();
        renderWizardRoutes();
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
    const hasAvailable = availableCount > 0;
    const cell = document.createElement("div");
    cell.className = `calendar-cell ${hasAvailable ? "" : "is-disabled"}`;
    const meta = availableCount
      ? `${availableCount} слота`
      : dateSlots.length
      ? "занято"
      : "нет слотов";
    cell.innerHTML = `
      <button type="button" data-date="${dateString}">${day}</button>
      <span class="calendar-cell__meta">${meta}</span>
    `;
    const button = cell.querySelector("button");
    if (!hasAvailable) {
      button.disabled = true;
    }
    button.addEventListener("click", () => {
      if (!hasAvailable) return;
      state.selectedDate = dateString;
      syncSelectedSlot();
      saveState();
      renderCalendarDay();
      renderWizardSlots();
    });
    elements.calendarGrid.appendChild(cell);
  }
};

const renderWizardRoutes = () => {
  const tags = [];
  const addTag = (tag) => {
    if (!tag || tag === "all" || tags.includes(tag)) return;
    tags.push(tag);
  };
  slotsData.forEach((slot) => addTag(slot.route_tag));
  postsData.forEach((post) => addTag(post.routeTag));
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
      renderWizardRoutes();
      renderCalendarDay();
      renderWizardSlots();
    });
    elements.routeGrid.appendChild(card);
  });
};

const renderWizardSlots = () => {
  elements.slotGrid.innerHTML = "";
  if (!state.selectedDate) {
    elements.slotGrid.innerHTML = "<p class=\"hint\">Выберите дату в календаре.</p>";
    return;
  }
  const filteredSlots = slotsData.filter((slot) => {
    if (!slot.is_available) return false;
    if (slot.date !== state.selectedDate) return false;
    if (!state.selectedRoute) return true;
    return slot.route_tag === "all" || slot.route_tag === state.selectedRoute;
  });
  if (!filteredSlots.length) {
    elements.slotGrid.innerHTML = "<p class=\"hint\">Нет доступных слотов.</p>";
    return;
  }
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
      state.selectedDate = slot.date;
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
  const list = reviewsData && reviewsData.length ? reviewsData : reviews;
  const ratings = [];
  const DEFAULT_REVIEW_RATING = 5;
  list.forEach((review) => {
    const author = review.author || review.name || "Гость";
    const text = review.text || review.body || review.caption || "";
    const rating = Number.isFinite(Number(review.rating)) ? Number(review.rating) : DEFAULT_REVIEW_RATING;
    ratings.push(rating);
    const mediaKind = review.media_kind === "video" || review.media_kind === "telegram_video" ? "video" : "photo";
    const mediaUrl = review.media_url || "";
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="media">
        ${
          mediaUrl && mediaKind === "video"
            ? `<video src="${mediaUrl}" controls preload="metadata"></video>`
            : `<img src="${mediaUrl || ASSETS.review}" alt="Отзыв ${author}" loading="lazy" />`
        }
      </div>
      <strong>${author}</strong>
      <div class="rating-stars" aria-label="Рейтинг ${rating} из 5">${renderStars(rating)}</div>
      <p>${text}</p>
    `;
    const img = card.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.src = ASSETS.review;
      });
    }
    elements.reviewGrid.appendChild(card);
  });
  renderReviewSummary(ratings);
  initReviewCarousel();
};

const renderStars = (rating) => {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < value ? "star star--filled" : "star";
    const glyph = index < value ? "★" : "☆";
    return `<span class="${filled}" aria-hidden="true">${glyph}</span>`;
  }).join("");
};

const renderReviewSummary = (ratings) => {
  const summary = document.getElementById("reviews-summary");
  if (!summary) return;
  if (!ratings.length) {
    summary.innerHTML = "";
    return;
  }
  const avg = ratings.reduce((sum, item) => sum + item, 0) / ratings.length;
  summary.innerHTML = `
    <div class="rating-stars rating-stars--summary" aria-label="Средний рейтинг ${avg.toFixed(1)} из 5">
      ${renderStars(avg)}
    </div>
    <span class="rating-value">${avg.toFixed(1)}</span>
  `;
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

const openDialog = (dialog) => {
  if (!dialog) return;
  const useFallback = () => {
    dialog.classList.add("is-open");
  };
  if (typeof dialog.showModal === "function") {
    try {
      dialog.showModal();
    } catch (error) {
      useFallback();
    }
  } else {
    useFallback();
  }
  document.body.classList.add("body--locked");
};

const closeDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) {
    dialog.close();
  }
  dialog.classList.remove("is-open");
  document.body.classList.remove("body--locked");
};

const setupModals = () => {
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeDialog(button.closest("dialog"));
    });
  });

  [elements.openReview, elements.reviewCta].forEach((button) => {
    if (!button || !elements.reviewModal) return;
    button.addEventListener("click", () => {
      openDialog(elements.reviewModal);
    });
  });
};

const ensureStoriesArrows = () => {
  const viewport = document.getElementById("stories-slider");
  if (!viewport) return null;
  const arrowSvg =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8.5 5.5l7 6.5-7 6.5-1.5-1.6 5.2-4.9-5.2-4.9z"/></svg>';
  let prev = viewport.querySelector(".stories__arrow--prev");
  let next = viewport.querySelector(".stories__arrow--next");
  if (!prev) {
    prev = document.createElement("button");
    prev.type = "button";
    prev.className = "stories__arrow stories__arrow--prev";
    prev.setAttribute("aria-label", "Previous story");
    prev.innerHTML = `<span aria-hidden="true" style="transform: rotate(180deg); display: inline-flex;">${arrowSvg}</span>`;
    viewport.appendChild(prev);
  }
  if (!next) {
    next = document.createElement("button");
    next.type = "button";
    next.className = "stories__arrow stories__arrow--next";
    next.setAttribute("aria-label", "Next story");
    next.innerHTML = `<span aria-hidden="true" style="display: inline-flex;">${arrowSvg}</span>`;
    viewport.appendChild(next);
  }
  return { prev, next };
};

const updateStoriesArrows = ($list, arrows) => {
  if (!$list || !arrows) return;
  const current = $list.slick("slickCurrentSlide");
  const total = $list.slick("getSlick").slideCount;
  const lastIndex = Math.max(total - 1, 0);
  arrows.prev.disabled = current <= 0;
  arrows.next.disabled = current >= lastIndex;
};

const initStoriesCarousel = () => {
  if (!elements.storiesList) return;
  elements.storiesList.classList.add("stories__list--fallback", "stories__list--strip");
};

const applyStories3DClasses = () => {};

const setupStoriesInteractions = () => {};

const setupStoriesSwipe = () => {};

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
  if (!elements.themeToggle) return;
  elements.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  });
};

const setupMenuToggle = () => {
  if (!elements.menuToggle || !elements.mobileMenu || !elements.menuOverlay) return;
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
    openDialog(elements.favoritesModal);
  });
};

const setupCalendarNavigation = () => {
  if (!elements.calendarPrev || !elements.calendarNext) return;
  elements.calendarPrev.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    const range = getMonthRange(calendarCursor);
    loadAvailability({ from: range.from, to: range.to, merge: true }).then(() => {
      renderCalendar();
      renderCalendarDay();
      renderWizardSlots();
    });
  });
  elements.calendarNext.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    const range = getMonthRange(calendarCursor);
    loadAvailability({ from: range.from, to: range.to, merge: true }).then(() => {
      renderCalendar();
      renderCalendarDay();
      renderWizardSlots();
    });
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

const loadReviewsFromApi = async () => {
  const response = await fetchJson("/api/reviews.php");
  reviewsData = response.items || reviewsData;
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

  try {
    await loadReviewsFromApi();
  } catch (error) {
    // fallback
  }

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const rangeStart = getMonthRange(prevMonth);
  const rangeEnd = getMonthRange(nextMonth);
  await loadAvailability({ from: rangeStart.from, to: rangeEnd.to });
};

const loadAvailability = async (range = {}) => {
  try {
    const params = new URLSearchParams();
    params.set("public", "1");
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    const availabilityResponse = await fetchJson(`/api/admin-availability.php?${params.toString()}`);
    const nextSlots = (availabilityResponse.slots || []).map(normalizeSlot);
    if (range.merge) {
      mergeSlots(nextSlots);
    } else {
      slotsData = nextSlots;
    }
    if (!state.selectedDate && slotsData.length) {
      const today = formatDate(new Date());
      const dates = Array.from(new Set(slotsData.map((slot) => slot.date))).sort();
      state.selectedDate = dates.includes(today) ? today : dates[0];
      saveState();
    }
    syncSelectedSlot();
    if (state.selectedDate) {
      const selected = parseDate(state.selectedDate);
      if (selected && !Number.isNaN(selected.getTime())) {
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
  topbarCompact = elements.topbar?.classList.contains("topbar--compact") || false;
  scheduleTopbarUpdate();
  elements.topbar?.addEventListener("transitionend", releaseTopbarLock);
  await loadPublicData();
  renderStories();
  setupStoriesSwipe();
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
  setupStoriesInteractions();
  setupComments();
  setupThemeToggle();
  setupMenuToggle();
  setupFavorites();
  setupReelsOverlay();
  setupCalendarNavigation();
  setupWizard();
  setupForm();
  setupReviewForm();
  renderPosts();
  window.addEventListener("scroll", scheduleTopbarUpdate, { passive: true });
};

init();
