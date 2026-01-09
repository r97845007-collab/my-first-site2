const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "include", ...options });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }
  return data;
};

const profileEmail = document.getElementById("profile-email");
const logoutBtn = document.getElementById("logout-btn");
const tokenInput = document.getElementById("bot-token");
const saveTokenBtn = document.getElementById("save-token");
const checkTokenBtn = document.getElementById("check-token");
const tokenStatus = document.getElementById("token-status");

const postsList = document.getElementById("posts-list");
const storiesList = document.getElementById("stories-list-admin");
const availabilityList = document.getElementById("availability-list");

const postForm = document.getElementById("post-form");
const storyForm = document.getElementById("story-form");
const calendarForm = document.getElementById("calendar-form");

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const showTab = (tab) => {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
};

const loadMe = async () => {
  try {
    const data = await fetchJson("/api/me");
    profileEmail.textContent = data.email;
  } catch (error) {
    window.location.href = "/login";
  }
};

const saveToken = async () => {
  tokenStatus.textContent = "Сохраняем...";
  try {
    await fetchJson("/api/telegram-save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botToken: tokenInput.value.trim() }),
    });
    tokenStatus.textContent = "Токен сохранён.";
  } catch (error) {
    tokenStatus.textContent = `Ошибка: ${error.message}`;
  }
};

const checkToken = async () => {
  tokenStatus.textContent = "Проверяем...";
  try {
    const data = await fetchJson("/api/telegram-status");
    tokenStatus.textContent = `Бот активен: ${data.telegram.username || data.telegram.first_name}`;
  } catch (error) {
    tokenStatus.textContent = `Ошибка: ${error.message}`;
  }
};

const loadPosts = async () => {
  const data = await fetchJson("/api/admin-posts");
  postsList.innerHTML = data.posts
    .map(
      (post) => `
      <div class="admin-item" data-id="${post.id}">
        <strong>${post.caption}</strong>
        <div class="hint">${post.type} · ${post.route_tag || "без тега"}</div>
        <div class="admin-item__actions">
          <button class="btn btn--ghost" data-action="edit">Редактировать</button>
          <button class="btn btn--ghost" data-action="delete">Удалить</button>
        </div>
      </div>
    `
    )
    .join("");
};

const loadStories = async () => {
  const data = await fetchJson("/api/admin-stories");
  storiesList.innerHTML = data.stories
    .map(
      (story) => `
      <div class="admin-item" data-id="${story.id}">
        <strong>${story.title}</strong>
        <div class="hint">${story.text || "Без описания"}</div>
        <div class="admin-item__actions">
          <button class="btn btn--ghost" data-action="edit">Редактировать</button>
          <button class="btn btn--ghost" data-action="delete">Удалить</button>
        </div>
      </div>
    `
    )
    .join("");
};

const loadAvailability = async () => {
  const data = await fetchJson("/api/admin-availability");
  availabilityList.innerHTML = data.slots
    .map(
      (slot) => `
      <div class="admin-item" data-id="${slot.id}">
        <strong>${slot.date} ${slot.time_slot}</strong>
        <div class="hint">Маршрут: ${slot.route_tag || "любой"} · ${
        slot.is_available ? "доступно" : "закрыто"
      }</div>
        <div class="admin-item__actions">
          <button class="btn btn--ghost" data-action="toggle">Переключить доступность</button>
          <button class="btn btn--ghost" data-action="delete">Удалить</button>
        </div>
      </div>
    `
    )
    .join("");
};

const handlePostSubmit = async (event) => {
  event.preventDefault();
  try {
    const data = new FormData(postForm);
    const response = await fetch("/api/admin-posts", {
      method: "POST",
      credentials: "include",
      body: data,
    });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error || "Ошибка сохранения поста");
    }
    postForm.reset();
    await loadPosts();
  } catch (error) {
    alert(error.message);
  }
};

const handleStorySubmit = async (event) => {
  event.preventDefault();
  try {
    const data = new FormData(storyForm);
    const response = await fetch("/api/admin-stories", {
      method: "POST",
      credentials: "include",
      body: data,
    });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error || "Ошибка сохранения воспоминания");
    }
    storyForm.reset();
    await loadStories();
  } catch (error) {
    alert(error.message);
  }
};

const handleCalendarSubmit = async (event) => {
  event.preventDefault();
  const data = new FormData(calendarForm);
  await fetchJson("/api/admin-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: data.get("date"),
      time_slot: data.get("time"),
      route_tag: data.get("routeTag"),
      is_available: Number(data.get("isAvailable")),
    }),
  });
  calendarForm.reset();
  await loadAvailability();
};

const handleListAction = async (event, type) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const item = event.target.closest(".admin-item");
  if (!item) return;
  const id = item.dataset.id;

  try {
    if (action === "delete") {
      await fetchJson(`/api/admin-${type}?id=${id}`, { method: "DELETE" });
    }

    if (action === "edit") {
      const caption = prompt("Введите новый текст", item.querySelector("strong").textContent);
      if (caption) {
        await fetchJson(`/api/admin-${type}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, caption, title: caption }),
        });
      }
    }

    if (action === "toggle") {
      await fetchJson(`/api/admin-availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, toggle: true }),
      });
    }

    if (type === "posts") await loadPosts();
    if (type === "stories") await loadStories();
    if (type === "availability") await loadAvailability();
  } catch (error) {
    alert(error.message);
  }
};

const logout = async () => {
  await fetchJson("/api/auth-logout", { method: "POST" });
  window.location.href = "/";
};

logoutBtn.addEventListener("click", logout);

saveTokenBtn.addEventListener("click", saveToken);
checkTokenBtn.addEventListener("click", checkToken);

postForm.addEventListener("submit", handlePostSubmit);
storyForm.addEventListener("submit", handleStorySubmit);
calendarForm.addEventListener("submit", handleCalendarSubmit);

postsList.addEventListener("click", (event) => handleListAction(event, "posts"));
storiesList.addEventListener("click", (event) => handleListAction(event, "stories"));
availabilityList.addEventListener("click", (event) => handleListAction(event, "availability"));

tabButtons.forEach((button) => {
  button.addEventListener("click", () => showTab(button.dataset.tab));
});
showTab("posts");

const init = async () => {
  await loadMe();
  await Promise.all([loadPosts(), loadStories(), loadAvailability()]);
};

init();
