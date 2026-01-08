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
  demoMode: false,
  demoToken: "",
  demoChatId: "",
  selectedRoute: null,
  selectedSlot: null,
};

const STORAGE_KEY = "cavalry-state";

const elements = {
  storiesList: document.getElementById("stories-list"),
  feedGrid: document.getElementById("feed-grid"),
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
  integrationModal: document.getElementById("integration-modal"),
  demoToggle: document.getElementById("demo-toggle"),
  demoToken: document.getElementById("demo-token"),
  demoChat: document.getElementById("demo-chat"),
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
  state.demoMode = parsed.demoMode || false;
  state.demoToken = parsed.demoToken || "";
  state.demoChatId = parsed.demoChatId || "";
  state.selectedRoute = parsed.selectedRoute || null;
  state.selectedSlot = parsed.selectedSlot || null;
};

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.setAttribute("aria-pressed", state.theme === "dark");
};

const renderStories = () => {
  elements.storiesList.innerHTML = "";
  stories.forEach((story) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "story-card";
    card.innerHTML = `
      <div class="story-avatar">${story.title.slice(0, 2)}</div>
      <div>${story.title}</div>
    `;
    card.addEventListener("click", () => openStory(story));
    elements.storiesList.appendChild(card);
  });
};

const openStory = (story) => {
  elements.storyContent.innerHTML = `
    <h3>${story.title}</h3>
    <p>${story.subtitle}</p>
    <div class="media">
      <span>Stories медиа-заглушка</span>
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
  return posts
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

const createPostCard = (post) => {
  const card = document.createElement("article");
  card.className = "post-card";
  card.id = `post-${post.id}`;
  const liked = Boolean(state.likes[post.id]);
  const saved = Boolean(state.saves[post.id]);
  const commentsCount = (state.comments[post.id] || []).length;
  card.innerHTML = `
    <div class="media ${post.type === "reel" ? "reel" : ""}">
      ${
        post.type === "reel"
          ? `<div class="play">▶</div><div>видео будет добавлено позже</div>`
          : `<div>Фото будет добавлено позже</div>`
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
  slots.forEach((slot) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "slot-card";
    card.innerHTML = `
      <strong>${slot.label}</strong>
      <p>${slot.date}</p>
      <p>${slot.time}</p>
    `;
    elements.slots.appendChild(card);
  });
};

const renderWizardRoutes = () => {
  const tags = Array.from(new Set(posts.map((post) => post.routeTag)));
  elements.routeGrid.innerHTML = "";
  tags.forEach((tag) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `route-card ${state.selectedRoute === tag ? "is-active" : ""}`;
    card.innerHTML = `
      <strong>${tag}</strong>
      <p>${posts.find((post) => post.routeTag === tag)?.durationLabel || ""}</p>
    `;
    card.addEventListener("click", () => {
      state.selectedRoute = tag;
      saveState();
      renderWizardRoutes();
    });
    elements.routeGrid.appendChild(card);
  });
};

const renderWizardSlots = () => {
  elements.slotGrid.innerHTML = "";
  slots.forEach((slot) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `slot-card ${state.selectedSlot === slot.id ? "is-active" : ""}`;
    card.innerHTML = `
      <strong>${slot.label}</strong>
      <p>${slot.date}</p>
      <p>${slot.time}</p>
    `;
    card.addEventListener("click", () => {
      state.selectedSlot = slot.id;
      saveState();
      renderWizardSlots();
    });
    elements.slotGrid.appendChild(card);
  });
};

const renderReviews = () => {
  elements.reviewGrid.innerHTML = "";
  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="media">
        <div>Отзыв</div>
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

  document.getElementById("open-integration").addEventListener("click", () => {
    elements.integrationModal.showModal();
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

const sendTelegram = async (payload) => {
  if (state.demoMode && state.demoToken && state.demoChatId) {
    const url = `https://api.telegram.org/bot${state.demoToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: state.demoChatId, text: payload }),
    });
    return response.ok;
  }
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: payload }),
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

    const slot = slots.find((item) => item.id === state.selectedSlot);
    const message = `Заявка с сайта\nМаршрут: ${state.selectedRoute}\nДата/время: ${
      slot ? `${slot.date} ${slot.time}` : "—"
    }\nИмя: ${formData.get("name")}\nТелефон: ${formData.get("phone")}\nКол-во людей: ${
      formData.get("people")
    }\nУровень: ${formData.get("level")}\nКомментарий: ${
      formData.get("comment") || "—"
    }\nИсточник: Сайт (my-first-site2)`;

    elements.telegramStatus.textContent = "Отправка...";
    try {
      const success = await sendTelegram(message);
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

const setupIntegration = () => {
  elements.demoToggle.checked = state.demoMode;
  elements.demoToken.value = state.demoToken;
  elements.demoChat.value = state.demoChatId;

  elements.demoToggle.addEventListener("change", () => {
    state.demoMode = elements.demoToggle.checked;
    saveState();
  });

  [elements.demoToken, elements.demoChat].forEach((input) => {
    input.addEventListener("input", () => {
      state.demoToken = elements.demoToken.value.trim();
      state.demoChatId = elements.demoChat.value.trim();
      saveState();
    });
  });
};

const init = () => {
  loadState();
  applyTheme();
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
  setupIntegration();
  renderPosts();
};

init();
