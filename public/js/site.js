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
};

const STORAGE_KEY = "cavalry-state";
const ASSETS = {
  story: "assets/images/stories/story-placeholder.svg",
  photo: "assets/images/posts/photo-placeholder.svg",
  reel: "assets/images/posts/reel-placeholder.svg",
  review: "assets/images/ui/review-placeholder.svg",
};

const elements = {
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
  mobileMenu: document.getElementById("mobile-menu"),
  slots: document.getElementById("slots"),
  routeGrid: document.getElementById("route-grid"),
  slotGrid: document.getElementById("slot-grid"),
  bookingForm: document.getElementById("booking-form"),
  formAlert: document.getElementById("form-alert"),
  telegramStatus: document.getElementById("telegram-status"),
  reviewGrid: document.getElementById("review-grid"),
};

let activeFilter = "all";
let visibleCount = 6;
let activePostId = null;
let postsData = [...posts];
let storiesData = [...stories];
let slotsData = [...slots];

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
};

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.setAttribute("aria-pressed", state.theme === "dark");
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
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
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : String(value).split(" ");
  } catch (error) {
    return String(value).split(" ");
  }
};

const normalizePost = (post) => ({
  ...post,
  routeTag: post.routeTag || post.route_tag || "Маршрут",
  durationLabel: post.durationLabel || post.duration_label || "",
  level: post.level || post.level_label || "",
  hashtags: parseHashtags(post.hashtags),
  dateCreated: post.dateCreated || post.created_at || new Date().toISOString(),
});

const normalizeSlot = (slot) => ({
  ...slot,
  label: slot.label || slot.route_tag || "Свободный слот",
});

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
  const hasMedia = story.telegram_file_id && story.media_kind !== "none";
  const mediaSrc = hasMedia
    ? `/api/media?type=story&id=${story.id}&kind=${story.media_kind === "telegram_video" ? "video" : "photo"}`
    : ASSETS.photo;
  elements.storyContent.innerHTML = `
    <h3>${story.title}</h3>
    <p>${story.subtitle || story.text || ""}</p>
    <div class="media">
      <img src="${mediaSrc}" alt="Воспоминание ${story.title}" loading="lazy" />
    </div>
  `;
  elements.storyModal.showModal();
};

const getPopularityScore = (post) => {
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
  const visible = list.slice(0, visibleCount);
  elements.feedGrid.innerHTML = "";
  visible.forEach((post) => elements.feedGrid.appendChild(createPostCard(post)));
  elements.showMore.hidden = visible.length >= list.length;
};

const resolvePostMediaSrc = (post) => {
  if (post.telegram_file_id && post.media_kind && post.media_kind !== "none") {
    const kind = post.media_kind === "telegram_video" ? "video" : "photo";
    return `/api/media?type=post&id=${post.id}&kind=${kind}`;
  }
  return post.type === "reel" ? ASSETS.reel : ASSETS.photo;
};

const createPostCard = (post) => {
  const card = document.createElement("article");
  card.className = "post-card";
  card.id = `post-${post.id}`;
  const liked = Boolean(state.likes[post.id]);
  const saved = Boolean(state.saves[post.id]);
  const commentsCount = (state.comments[post.id] || []).length;
  const mediaSrc = resolvePostMediaSrc(post);
  const isReel = post.type === "reel" || post.media_kind === "telegram_video";
  card.innerHTML = `
    <div class="media ${isReel ? "reel" : ""}">
      <img src="${mediaSrc}" alt="${isReel ? "Рилс" : "Фото"}: ${post.caption}" loading="lazy" />
      ${
        isReel
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
          ❤️ ${liked ? "Лайк" : "Лайк"}
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

  return card;
};

const handlePostAction = async (post, action) => {
  if (action === "like") {
    state.likes[post.id] = !state.likes[post.id];
    saveState();
    renderPosts();
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
      await navigator.clipboard.writeText(url);
      elements.telegramStatus.textContent = "Ссылка скопирована";
    } catch (error) {
      elements.telegramStatus.textContent = "Скопируйте ссылку вручную: " + url;
    }
  }
};

const openComments = (postId) => {
  activePostId = postId;
  renderComments();
  elements.commentModal.showModal();
};

const renderComments = () => {
  const list = state.comments[activePostId] || [];
  elements.commentList.innerHTML = list
    .map(
      (comment) => `
      <div class="comment-item">
        <strong>${comment.name}</strong>
        <p>${comment.text}</p>
        <small>${comment.date}</small>
      </div>
    `
    )
    .join("");
};

const renderSlots = () => {
  elements.slots.innerHTML = "";
  slotsData.forEach((slot) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `slot-card ${slot.is_available === 0 ? "is-disabled" : ""}`;
    card.innerHTML = `
      <strong>${slot.label}</strong>
      <p>${slot.date}</p>
      <p>${slot.time}</p>
    `;
    if (slot.is_available === 0) {
      card.disabled = true;
    }
    elements.slots.appendChild(card);
  });
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
  slotsData.forEach((slot) => {
    const card = document.createElement("button");
    card.type = "button";
    const isDisabled = slot.is_available === 0;
    card.className = `slot-card ${state.selectedSlot === slot.id ? "is-active" : ""} ${
      isDisabled ? "is-disabled" : ""
    }`;
    card.innerHTML = `
      <strong>${slot.label}</strong>
      <p>${slot.date}</p>
      <p>${slot.time}</p>
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
    const hasMedia = review.telegram_file_id && review.media_kind && review.media_kind !== "none";
    const mediaSrc = hasMedia
      ? `/api/media?type=post&id=${review.id}&kind=${review.media_kind === "telegram_video" ? "video" : "photo"}`
      : ASSETS.review;
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="media">
        <img src="${mediaSrc}" alt="Отзыв ${review.author}" loading="lazy" />
      </div>
      <strong>${review.author}</strong>
      <p>${review.text}</p>
    `;
    elements.reviewGrid.appendChild(card);
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
      visibleCount = 6;
      renderPosts();
      scrollToFeed();
    });
  });
  setActiveChip(elements.filterChips[0]);
};

const setupSearch = () => {
  elements.feedSearch.addEventListener("input", () => {
    visibleCount = 6;
    renderPosts();
  });
  elements.globalSearch.addEventListener("input", () => {
    visibleCount = 6;
    renderPosts();
  });
};

const setupSorting = () => {
  elements.sortSelect.addEventListener("change", renderPosts);
};

const setupShowMore = () => {
  elements.showMore.addEventListener("click", () => {
    visibleCount += 4;
    renderPosts();
  });
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
  elements.commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.commentForm);
    const name = formData.get("comment-name").trim();
    const text = formData.get("comment-text").trim();
    if (name.length < 2 || text.length < 2) return;
    const list = state.comments[activePostId] || [];
    list.push({ name, text, date: new Date().toLocaleDateString("ru-RU") });
    state.comments[activePostId] = list;
    saveState();
    elements.commentForm.reset();
    renderComments();
    renderPosts();
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
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.mobileMenu.style.display === "flex";
    elements.mobileMenu.style.display = isOpen ? "none" : "flex";
    elements.menuToggle.setAttribute("aria-expanded", String(!isOpen));
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
  const response = await fetch("/api/lead-send", {
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
      await fetchJson("/api/review-submit", { method: "POST", body: payload });
      elements.reviewStatus.textContent = "Спасибо! Отзыв отправлен.";
      elements.reviewForm.reset();
      elements.reviewPreview.innerHTML = "";
    } catch (error) {
      elements.reviewStatus.textContent = `Ошибка: ${error.message}`;
    }
  });
};

const loadPublicData = async () => {
  try {
    const postsResponse = await fetchJson("/api/admin-posts?public=1");
    postsData = (postsResponse.posts || postsData).map(normalizePost);
    elements.feedStatus.textContent = "";
  } catch (error) {
    elements.feedStatus.textContent = "Показываем демо-ленту: сервер недоступен.";
  }

  try {
    const storiesResponse = await fetchJson("/api/admin-stories?public=1");
    storiesData = storiesResponse.stories || storiesData;
  } catch (error) {
    // fallback
  }

  await loadAvailability();
};

const loadAvailability = async () => {
  try {
    const routeParam = state.selectedRoute ? `?route=${encodeURIComponent(state.selectedRoute)}` : "";
    const availabilityResponse = await fetchJson(`/api/availability${routeParam}`);
    slotsData = (availabilityResponse.slots || slotsData).map(normalizeSlot);
  } catch (error) {
    // fallback
  }
};

const init = async () => {
  loadState();
  applyTheme();
  await loadPublicData();
  renderStories();
  renderSlots();
  renderWizardRoutes();
  renderWizardSlots();
  renderReviews();
  setupFilters();
  setupSearch();
  setupSorting();
  setupShowMore();
  setupModals();
  setupComments();
  setupThemeToggle();
  setupMenuToggle();
  setupWizard();
  setupForm();
  setupReviewForm();
  renderPosts();
};

init();
