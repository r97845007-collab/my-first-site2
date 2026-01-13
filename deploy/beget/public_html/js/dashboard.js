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

const MAX_VIDEO_MB = 20;
const MAX_IMAGE_MB = 10;
const MAX_POST_MEDIA = 10;
const RECOMMENDED_VIDEO_SECONDS = 20;
const LONG_VIDEO_SECONDS = 180;
const VIDEO_THUMB_SIZE = 256;

let postMediaFiles = [];
let postMediaPreviewUrls = new Map();
let postVideoThumbBlob = null;
let postVideoThumbIndex = null;
let postVideoThumbPreviewUrl = null;
let postMediaList = null;
let postVideoDurations = new Map();
let postStatusEl = null;

let storyMediaFiles = [];
let storyMediaPreviewUrls = new Map();
let storyVideoThumbBlob = null;
let storyVideoThumbIndex = null;
let storyVideoThumbPreviewUrl = null;
let storyMediaList = null;
let storyVideoDurations = new Map();
let storyStatusEl = null;

const resetPostMediaState = () => {
  postMediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  postMediaPreviewUrls = new Map();
  if (postVideoThumbPreviewUrl) {
    URL.revokeObjectURL(postVideoThumbPreviewUrl);
    postVideoThumbPreviewUrl = null;
  }
  postMediaFiles = [];
  postVideoThumbBlob = null;
  postVideoThumbIndex = null;
  postVideoDurations = new Map();
  if (postMediaList) postMediaList.innerHTML = "";
  if (postStatusEl) {
    postStatusEl.textContent = "";
    postStatusEl.classList.remove("warning", "alert");
  }
};

const resetStoryMediaState = () => {
  storyMediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  storyMediaPreviewUrls = new Map();
  if (storyVideoThumbPreviewUrl) {
    URL.revokeObjectURL(storyVideoThumbPreviewUrl);
    storyVideoThumbPreviewUrl = null;
  }
  storyMediaFiles = [];
  storyVideoThumbBlob = null;
  storyVideoThumbIndex = null;
  storyVideoDurations = new Map();
  if (storyMediaList) storyMediaList.innerHTML = "";
  if (storyStatusEl) {
    storyStatusEl.textContent = "";
    storyStatusEl.classList.remove("warning", "alert");
  }
};

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

const setupPostMediaValidation = () => {
  if (!postForm) return;
  const input = postForm.querySelector('input[name="media"]');
  if (!input) return;
  postStatusEl = document.createElement("div");
  postStatusEl.className = "hint";
  input.parentElement.appendChild(postStatusEl);
  postMediaList = document.getElementById("post-media-list");

  const resetStatus = () => {
    if (!postStatusEl) return;
    postStatusEl.textContent = "";
    postStatusEl.classList.remove("warning", "alert");
  };

  const setStatus = (message, type) => {
    if (!postStatusEl) return;
    postStatusEl.textContent = message;
    postStatusEl.classList.remove("warning", "alert");
    if (type) postStatusEl.classList.add(type);
  };

  const fileIsMp4 = (file) => {
    if (file.type) return file.type === "video/mp4";
    return file.name.toLowerCase().endsWith(".mp4");
  };

  const fileIsImage = (file) => file.type.startsWith("image/");

  const formatBytes = (value) => {
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const updateVideoDuration = (file) => {
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = Math.round(tempVideo.duration || 0);
      postVideoDurations.set(file, duration);
      if (duration >= LONG_VIDEO_SECONDS) {
        setStatus(`Warning: very long video (${duration}s). Recommended <= ${RECOMMENDED_VIDEO_SECONDS}s.`, "warning");
      } else if (duration > RECOMMENDED_VIDEO_SECONDS) {
        setStatus(`Warning: video duration ${duration}s (recommended <= ${RECOMMENDED_VIDEO_SECONDS}s).`, "warning");
      }
      renderPostMediaList();
    };
  };

  const renderPostMediaList = () => {
    if (!postMediaList) return;
    postMediaList.innerHTML = "";
    postMediaFiles.forEach((file, index) => {
      const isVideo = file.type.startsWith("video/");
      let previewUrl = postMediaPreviewUrls.get(file);
      if (!previewUrl && fileIsImage(file)) {
        previewUrl = URL.createObjectURL(file);
        postMediaPreviewUrls.set(file, previewUrl);
      }
      const duration = postVideoDurations.get(file);
      const item = document.createElement("div");
      item.className = "admin-media-item";
      const thumbContent = isVideo
        ? `<div class="admin-media-thumb" style="display:flex;align-items:center;justify-content:center;font-size:12px;">VIDEO</div>`
        : previewUrl
          ? `<img class="admin-media-thumb" src="${previewUrl}" alt="Preview" />`
          : `<div class="admin-media-thumb"></div>`;
      const thumbOverride =
        isVideo && postVideoThumbBlob && postVideoThumbIndex === index
          ? `<img class="admin-media-thumb" src="${postVideoThumbPreviewUrl || ""}" alt="Video thumb" />`
          : thumbContent;
      item.innerHTML = `
        ${thumbOverride}
        <div class="admin-media-meta">
          <strong>${file.name}</strong>
          <span>${isVideo ? "Video (MP4)" : "Image"} · ${formatBytes(file.size)}</span>
          ${isVideo && Number.isFinite(duration) ? `<span>Duration: ${duration}s</span>` : ""}
        </div>
        <div class="admin-media-actions">
          <button type="button" data-action="up" data-index="${index}">Up</button>
          <button type="button" data-action="down" data-index="${index}">Down</button>
          <button type="button" data-action="remove" data-index="${index}">Remove</button>
        </div>
      `;
      postMediaList.appendChild(item);
    });
  };

  const applySelection = (files) => {
    resetStatus();
    resetPostMediaState();

    const next = [];
    let videoCount = 0;
    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/") || fileIsMp4(file);
      if (isVideo && !fileIsMp4(file)) {
        setStatus("Only MP4 video is allowed.", "alert");
        return;
      }
      if (isVideo) {
        videoCount += 1;
        if (videoCount > 1) {
          setStatus("Only one video is allowed per post.", "alert");
          videoCount -= 1;
          return;
        }
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
          setStatus(`Video is larger than ${MAX_VIDEO_MB}MB.`, "alert");
          return;
        }
      } else if (fileIsImage(file)) {
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          setStatus(`Image is larger than ${MAX_IMAGE_MB}MB.`, "alert");
          return;
        }
      } else {
        setStatus("Only images or MP4 video are allowed.", "alert");
        return;
      }
      next.push(file);
    });

    if (next.length > MAX_POST_MEDIA) {
      setStatus(`Maximum ${MAX_POST_MEDIA} files per post.`, "alert");
      next.splice(MAX_POST_MEDIA);
    }

    postMediaFiles = next;
    postMediaFiles.forEach((file, index) => {
      if (file.type.startsWith("video/")) {
        updateVideoDuration(file);
        extractVideoThumb(file).then((result) => {
          if (!result?.blob) return;
          postVideoThumbBlob = result.blob;
          postVideoThumbIndex = index;
          if (postVideoThumbPreviewUrl) URL.revokeObjectURL(postVideoThumbPreviewUrl);
          postVideoThumbPreviewUrl = URL.createObjectURL(result.blob);
          renderPostMediaList();
        });
      }
    });
    renderPostMediaList();
  };

  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    applySelection(files);
    input.value = "";
  });

  postMediaList?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    if (!Number.isFinite(index)) return;
    if (action === "remove") {
      postMediaFiles.splice(index, 1);
      if (postVideoThumbIndex === index) {
        postVideoThumbBlob = null;
        postVideoThumbIndex = null;
      } else if (postVideoThumbIndex !== null && postVideoThumbIndex > index) {
        postVideoThumbIndex -= 1;
      }
    }
    if (action === "up" && index > 0) {
      const temp = postMediaFiles[index - 1];
      postMediaFiles[index - 1] = postMediaFiles[index];
      postMediaFiles[index] = temp;
      if (postVideoThumbIndex === index) {
        postVideoThumbIndex = index - 1;
      } else if (postVideoThumbIndex === index - 1) {
        postVideoThumbIndex = index;
      }
    }
    if (action === "down" && index < postMediaFiles.length - 1) {
      const temp = postMediaFiles[index + 1];
      postMediaFiles[index + 1] = postMediaFiles[index];
      postMediaFiles[index] = temp;
      if (postVideoThumbIndex === index) {
        postVideoThumbIndex = index + 1;
      } else if (postVideoThumbIndex === index + 1) {
        postVideoThumbIndex = index;
      }
    }
    renderPostMediaList();
  });
};

const setupStoryMediaValidation = () => {
  if (!storyForm) return;
  const input = storyForm.querySelector('input[name="media"]');
  if (!input) return;
  storyStatusEl = document.createElement("div");
  storyStatusEl.className = "hint";
  input.parentElement.appendChild(storyStatusEl);
  storyMediaList = document.getElementById("story-media-list");

  const resetStatus = () => {
    if (!storyStatusEl) return;
    storyStatusEl.textContent = "";
    storyStatusEl.classList.remove("warning", "alert");
  };

  const setStatus = (message, type) => {
    if (!storyStatusEl) return;
    storyStatusEl.textContent = message;
    storyStatusEl.classList.remove("warning", "alert");
    if (type) storyStatusEl.classList.add(type);
  };

  const fileIsMp4 = (file) => {
    if (file.type) return file.type === "video/mp4";
    return file.name.toLowerCase().endsWith(".mp4");
  };

  const fileIsImage = (file) => file.type.startsWith("image/");

  const formatBytes = (value) => {
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };


  const updateVideoDuration = (file) => {
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = Math.round(tempVideo.duration || 0);
      storyVideoDurations.set(file, duration);
      if (duration >= LONG_VIDEO_SECONDS) {
        setStatus(`Warning: very long video (${duration}s). Recommended <= ${RECOMMENDED_VIDEO_SECONDS}s.`, "warning");
      } else if (duration > RECOMMENDED_VIDEO_SECONDS) {
        setStatus(`Warning: video duration ${duration}s (recommended <= ${RECOMMENDED_VIDEO_SECONDS}s).`, "warning");
      }
      renderStoryMediaList();
    };
  };

  const renderStoryMediaList = () => {
    if (!storyMediaList) return;
    storyMediaList.innerHTML = "";
    storyMediaFiles.forEach((file, index) => {
      const isVideo = file.type.startsWith("video/");
      let previewUrl = storyMediaPreviewUrls.get(file);
      if (!previewUrl && fileIsImage(file)) {
        previewUrl = URL.createObjectURL(file);
        storyMediaPreviewUrls.set(file, previewUrl);
      }
      const duration = storyVideoDurations.get(file);
      const item = document.createElement("div");
      item.className = "admin-media-item";
      const thumbContent = isVideo
        ? `<div class="admin-media-thumb" style="display:flex;align-items:center;justify-content:center;font-size:12px;">VIDEO</div>`
        : previewUrl
          ? `<img class="admin-media-thumb" src="${previewUrl}" alt="Preview" />`
          : `<div class="admin-media-thumb"></div>`;
      const thumbOverride =
        isVideo && storyVideoThumbBlob && storyVideoThumbIndex === index
          ? `<img class="admin-media-thumb" src="${storyVideoThumbPreviewUrl || ""}" alt="Video thumb" />`
          : thumbContent;
      item.innerHTML = `
        ${thumbOverride}
        <div class="admin-media-meta">
          <strong>${file.name}</strong>
          <span>${isVideo ? "Video (MP4)" : "Image"} · ${formatBytes(file.size)}</span>
          ${isVideo && Number.isFinite(duration) ? `<span>Duration: ${duration}s</span>` : ""}
        </div>
        <div class="admin-media-actions">
          <button type="button" data-action="up" data-index="${index}">Up</button>
          <button type="button" data-action="down" data-index="${index}">Down</button>
          <button type="button" data-action="remove" data-index="${index}">Remove</button>
        </div>
      `;
      storyMediaList.appendChild(item);
    });
  };

  const applySelection = (files) => {
    resetStatus();
    resetStoryMediaState();

    const next = [];
    let videoCount = 0;
    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/") || fileIsMp4(file);
      if (isVideo && !fileIsMp4(file)) {
        setStatus("Only MP4 video is allowed.", "alert");
        return;
      }
      if (isVideo) {
        videoCount += 1;
        if (videoCount > 1) {
          setStatus("Only one video is allowed per story.", "alert");
          videoCount -= 1;
          return;
        }
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
          setStatus(`Video is larger than ${MAX_VIDEO_MB}MB.`, "alert");
          return;
        }
      } else if (fileIsImage(file)) {
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          setStatus(`Image is larger than ${MAX_IMAGE_MB}MB.`, "alert");
          return;
        }
      } else {
        setStatus("Only images or MP4 videos are allowed.", "alert");
        return;
      }
      next.push(file);
    });

    if (next.length > 6) {
      setStatus("Maximum 6 files per story.", "alert");
      next.splice(6);
    }

    storyMediaFiles = next;
    storyMediaFiles.forEach((file, index) => {
      if (file.type.startsWith("video/")) {
        updateVideoDuration(file);
        extractVideoThumb(file).then((result) => {
          if (!result?.blob) return;
          storyVideoThumbBlob = result.blob;
          storyVideoThumbIndex = index;
          if (storyVideoThumbPreviewUrl) URL.revokeObjectURL(storyVideoThumbPreviewUrl);
          storyVideoThumbPreviewUrl = URL.createObjectURL(result.blob);
          renderStoryMediaList();
        });
      }
    });
    renderStoryMediaList();
  };

  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    applySelection(files);
    input.value = "";
  });

  storyMediaList?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    if (!Number.isFinite(index)) return;
    if (action === "remove") {
      storyMediaFiles.splice(index, 1);
      if (storyVideoThumbIndex === index) {
        storyVideoThumbBlob = null;
        storyVideoThumbIndex = null;
      } else if (storyVideoThumbIndex !== null && storyVideoThumbIndex > index) {
        storyVideoThumbIndex -= 1;
      }
    }
    if (action === "up" && index > 0) {
      const temp = storyMediaFiles[index - 1];
      storyMediaFiles[index - 1] = storyMediaFiles[index];
      storyMediaFiles[index] = temp;
      if (storyVideoThumbIndex === index) {
        storyVideoThumbIndex = index - 1;
      } else if (storyVideoThumbIndex === index - 1) {
        storyVideoThumbIndex = index;
      }
    }
    if (action === "down" && index < storyMediaFiles.length - 1) {
      const temp = storyMediaFiles[index + 1];
      storyMediaFiles[index + 1] = storyMediaFiles[index];
      storyMediaFiles[index] = temp;
      if (storyVideoThumbIndex === index) {
        storyVideoThumbIndex = index + 1;
      } else if (storyVideoThumbIndex === index + 1) {
        storyVideoThumbIndex = index;
      }
    }
    renderStoryMediaList();
  });
};

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const renderMediaPreview = (item) => {
  const mediaList = Array.isArray(item?.media) ? item.media : [];
  const first = mediaList[0];
  const mediaUrl = first?.media_url || item?.media_url || "";
  const mediaType = first?.media_type || item?.media_kind || "";
  const thumbUrl = first?.thumb_url || first?.poster_url || "";
  if (!mediaUrl && !thumbUrl) return "";
  if (String(mediaType).includes("video")) {
    return `<img class="admin-thumb" src="${thumbUrl || mediaUrl}" alt="Preview" loading="lazy" />`;
  }
  return `<img class="admin-thumb" src="${thumbUrl || mediaUrl}" alt="Медиа" loading="lazy" />`;
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
    postMediaFiles.forEach((file) => {
      data.append("media[]", file);
    });
    if (postVideoThumbBlob && postVideoThumbIndex !== null) {
      data.append("video_thumb", postVideoThumbBlob, "thumb.jpg");
      data.append("video_thumb_index", String(postVideoThumbIndex));
    }
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
    resetPostMediaState();
    await loadPosts();
  } catch (error) {
    alert(error.message);
  }
};

const handleStorySubmit = async (event) => {
  event.preventDefault();
  try {
    const data = new FormData(storyForm);
    storyMediaFiles.forEach((file) => {
      data.append("media[]", file);
    });
    if (storyVideoThumbBlob && storyVideoThumbIndex !== null) {
      data.append("video_thumb", storyVideoThumbBlob, "thumb.jpg");
      data.append("video_thumb_index", String(storyVideoThumbIndex));
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
    resetStoryMediaState();
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
  setupPostMediaValidation();
  setupStoryMediaValidation();
  await loadMe();
  await Promise.all([loadPosts(), loadStories(), loadAvailability()]);
};

init();
