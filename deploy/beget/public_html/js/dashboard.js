const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "include", ...options });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Server returned non-JSON (HTTP ${response.status}).`);
  }
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

const MAX_VIDEO_MB = 50;
const RECOMMENDED_VIDEO_SECONDS = 60;
const LONG_VIDEO_SECONDS = 180;
const VIDEO_THUMB_SIZE = 256;

let storyThumbBlob = null;
let storyThumbPreview = null;

const extractVideoThumb = async (file, opts = {}) => {
  const timeoutMs = opts.timeoutMs || 35000;
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
    };

    timeoutId = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const target = Math.min(0.3, Math.max(0.1, duration * 0.1));
      try {
        video.currentTime = target;
      } catch (error) {
        cleanup();
        resolve(null);
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = VIDEO_THUMB_SIZE;
        canvas.height = VIDEO_THUMB_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          cleanup();
          resolve(null);
          return;
        }
        const side = Math.min(w, h);
        const sx = (w - side) / 2;
        const sy = (h - side) / 2;
        ctx.drawImage(video, sx, sy, side, side, 0, 0, VIDEO_THUMB_SIZE, VIDEO_THUMB_SIZE);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              resolve(null);
              return;
            }
            resolve({ blob, width: w, height: h, time: video.currentTime });
          },
          "image/jpeg",
          0.82
        );
      } catch (error) {
        cleanup();
        resolve(null);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
    };

    video.src = url;
  });
};

const setupStoryMediaValidation = () => {
  if (!storyForm) return;
  const input = storyForm.querySelector('input[name="media"]');
  if (!input) return;
  const status = document.createElement("div");
  status.className = "hint";
  input.parentElement.appendChild(status);

  storyThumbPreview = document.createElement("img");
  storyThumbPreview.className = "admin-thumb";
  storyThumbPreview.style.display = "none";
  input.parentElement.appendChild(storyThumbPreview);

  const resetStatus = () => {
    status.textContent = "";
    status.classList.remove("warning", "alert");
  };

  const setStatus = (message, type) => {
    status.textContent = message;
    status.classList.remove("warning", "alert");
    if (type) status.classList.add(type);
  };

  const fileIsMp4 = (file) => {
    if (file.type) return file.type === "video/mp4";
    return file.name.toLowerCase().endsWith(".mp4");
  };

  input.addEventListener("change", () => {
    resetStatus();
    storyThumbBlob = null;
    if (storyThumbPreview) {
      storyThumbPreview.src = "";
      storyThumbPreview.style.display = "none";
    }
    const file = input.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || fileIsMp4(file);
    if (isVideo && !fileIsMp4(file)) {
      setStatus("Only MP4 video is allowed.", "alert");
      input.value = "";
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setStatus(`Video is larger than ${MAX_VIDEO_MB}MB.`, "alert");
      input.value = "";
      return;
    }

    if (isVideo) {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      tempVideo.src = objectUrl;
      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const duration = Math.round(tempVideo.duration || 0);
        if (duration >= LONG_VIDEO_SECONDS) {
          setStatus(`Warning: long video (${duration}s). Recommended <= ${RECOMMENDED_VIDEO_SECONDS}s.`, "warning");
          return;
        }
        if (duration > RECOMMENDED_VIDEO_SECONDS) {
          setStatus(`Warning: video duration ${duration}s (recommended <= ${RECOMMENDED_VIDEO_SECONDS}s).`, "warning");
          return;
        }
        setStatus(`Duration: ${duration}s.`, "");
      };

      extractVideoThumb(file).then((result) => {
        if (!result?.blob) return;
        storyThumbBlob = result.blob;
        if (storyThumbPreview) {
          storyThumbPreview.src = URL.createObjectURL(result.blob);
          storyThumbPreview.style.display = "block";
        }
      });
    }
  });
};

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const renderMediaPreview = (item) => {
  if (!item?.media_url) return "";
  if (item.media_kind === "video") {
    return `<video class="admin-thumb" controls src="${item.media_url}"></video>`;
  }
  return `<img class="admin-thumb" src="${item.media_url}" alt="Медиа" loading="lazy" />`;
};

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
    const data = await fetchJson("/api/me.php");
    profileEmail.textContent = data.email;
  } catch (error) {
    window.location.href = "/login";
  }
};

const saveToken = async () => {
  tokenStatus.textContent = "Сохраняем...";
  try {
    await fetchJson("/api/telegram-save-token.php", {
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
    const data = await fetchJson("/api/telegram-status.php");
    tokenStatus.textContent = `Бот активен: ${data.telegram.username || data.telegram.first_name}`;
  } catch (error) {
    tokenStatus.textContent = `Ошибка: ${error.message}`;
  }
};

const loadPosts = async () => {
  const data = await fetchJson("/api/admin-posts.php");
  postsList.innerHTML = data.posts
    .map(
      (post) => `
      <div class="admin-item" data-id="${post.id}">
        <strong>${post.caption}</strong>
        <div class="hint">${post.type} · ${post.route_tag || "без тега"}</div>
        ${renderMediaPreview(post)}
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
  const data = await fetchJson("/api/admin-stories.php");
  storiesList.innerHTML = data.stories
    .map(
      (story) => `
      <div class="admin-item" data-id="${story.id}">
        <strong>${story.title || story.caption}</strong>
        <div class="hint">${story.text || story.body || "Без описания"}</div>
        ${renderMediaPreview(story)}
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
  const data = await fetchJson("/api/admin-availability.php");
  availabilityList.innerHTML = data.slots
    .map(
      (slot) => `
      <div class="admin-item" data-id="${slot.id}">
        <strong>${slot.date} ${slot.time_slot}</strong>
        <div class="hint">Маршрут: ${
          slot.route_tag && slot.route_tag !== "all" ? slot.route_tag : "Все маршруты"
        } · ${
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

const resolveRouteTag = (formData) => {
  const selection = (formData.get("routeTag") || "").toString();
  const custom = (formData.get("routeTagCustom") || "").toString().trim();
  if (selection === "other") {
    return custom || "all";
  }
  return selection || "all";
};

const handlePostSubmit = async (event) => {
  event.preventDefault();
  try {
    const data = new FormData(postForm);
    data.set("routeTag", resolveRouteTag(data));
    const response = await fetch("/api/admin-posts.php", {
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
    if (storyThumbBlob) {
      data.append("video_thumb", storyThumbBlob, "thumb.jpg");
    }
    const response = await fetch("/api/admin-stories.php", {
      method: "POST",
      credentials: "include",
      body: data,
    });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error || "Ошибка сохранения воспоминания");
    }
    storyForm.reset();
    storyThumbBlob = null;
    if (storyThumbPreview) {
      storyThumbPreview.src = "";
      storyThumbPreview.style.display = "none";
    }
    await loadStories();
  } catch (error) {
    alert(error.message);
  }
};

const handleCalendarSubmit = async (event) => {
  event.preventDefault();
  const data = new FormData(calendarForm);
  const routeTag = resolveRouteTag(data);
  await fetchJson("/api/admin-availability.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: data.get("date"),
      time_slot: data.get("time"),
      route_tag: routeTag,
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
      await fetchJson(`/api/admin-${type}.php?id=${id}`, { method: "DELETE" });
    }

    if (action === "edit") {
      const caption = prompt("Введите новый текст", item.querySelector("strong").textContent);
      if (caption) {
        await fetchJson(`/api/admin-${type}.php`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, caption, title: caption }),
        });
      }
    }

    if (action === "toggle") {
      await fetchJson(`/api/admin-availability.php`, {
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
  await fetchJson("/api/auth-logout.php", { method: "POST" });
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
  setupStoryMediaValidation();
  await loadMe();
  await Promise.all([loadPosts(), loadStories(), loadAvailability()]);
};

init();
