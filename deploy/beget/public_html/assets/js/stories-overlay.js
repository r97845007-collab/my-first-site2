(() => {
  const STORY_SELECTOR = ".stories__item";
  const VISIBILITY_THRESHOLD = 0.6;
  const WINDOW_SIZE = 1;
  const LOAD_TIMEOUT = 8000;
  const DEBUG = Boolean(window.__DEV__) || new URLSearchParams(window.location.search).get("debug") === "1";

  let overlay = null;
  let track = null;
  let progress = null;
  let items = [];
  let activeStoryIndex = 0;
  let observer = null;
  let scrollY = 0;
  let historyActive = false;
  let closing = false;
  const mediaTimeouts = new Map();

  const log = (event, data = {}) => {
    if (!DEBUG) return;
    try {
      console.log("[stories]", event, data);
    } catch (error) {
      // Ignore logging errors.
    }
  };

  const normalizeMediaType = (value) => (value || "").toLowerCase().includes("video") ? "video" : "image";

  const normalizeMediaItem = (item) => {
    const mediaUrl = item.media_url || item.mediaUrl || "";
    const mediaType = normalizeMediaType(item.media_type || item.mediaType || item.kind || item.media_kind);
    const posterUrl = item.thumb_url || item.poster_url || item.posterUrl || item.poster || "";
    return { mediaUrl, mediaType, posterUrl };
  };

  const collectStories = () => {
    const nodes = Array.from(document.querySelectorAll(STORY_SELECTOR));
    return nodes
      .map((node) => {
        let media = [];
        if (node.dataset.media) {
          try {
            const parsed = JSON.parse(node.dataset.media);
            if (Array.isArray(parsed)) {
              media = parsed.map(normalizeMediaItem).filter((item) => item.mediaUrl || item.posterUrl);
            }
          } catch (error) {
            media = [];
          }
        }
        if (!media.length) {
          const mediaUrl = node.dataset.mediaUrl || node.dataset.mediaSrc || "";
          const mediaType = normalizeMediaType(node.dataset.mediaType);
          const posterUrl = node.dataset.posterUrl || node.dataset.poster || "";
          const img = node.querySelector("img");
          const fallbackPoster = posterUrl || img?.getAttribute("data-src") || img?.getAttribute("src") || "";
          if (mediaUrl || fallbackPoster) {
            media = [{ mediaUrl, mediaType, posterUrl: fallbackPoster }];
          }
        }
        return {
          id: node.dataset.storyId || "",
          title: node.dataset.title || "",
          caption: node.dataset.caption || node.dataset.subtitle || "",
          media,
          activeMediaIndex: 0,
        };
      })
      .filter((item) => item.media.length);
  };

  const createOverlay = () => {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "stories-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="stories-overlay__backdrop" data-stories-close></div>
      <div class="stories-overlay__panel">
        <button class="stories-overlay__close" type="button" data-stories-close aria-label="Закрыть">✕</button>
        <div class="stories-overlay__progress" aria-hidden="true"></div>
        <div class="stories-overlay__track" tabindex="0"></div>
        <div class="stories-overlay__tap stories-overlay__tap--left" data-stories-prev></div>
        <div class="stories-overlay__tap stories-overlay__tap--right" data-stories-next></div>
      </div>
    `;
    document.body.appendChild(overlay);
    track = overlay.querySelector(".stories-overlay__track");
    progress = overlay.querySelector(".stories-overlay__progress");
    let swipePointerId = null;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeHandled = false;

    overlay.addEventListener("click", (event) => {
      if (event.target.closest("[data-stories-close]")) {
        closeStories();
      }
      if (event.target.closest("[data-stories-prev]")) {
        moveMedia(-1);
      }
      if (event.target.closest("[data-stories-next]")) {
        moveMedia(1);
      }
    });

    track.addEventListener("pointerdown", (event) => {
      swipePointerId = event.pointerId;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      swipeHandled = false;
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if (swipePointerId !== event.pointerId || swipeHandled) return;
      const dx = event.clientX - swipeStartX;
      const dy = event.clientY - swipeStartY;
      if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
      event.preventDefault();
      swipeHandled = true;
      if (dx < 0) {
        moveMedia(1);
      } else {
        moveMedia(-1);
      }
    });

    const endSwipe = (event) => {
      if (swipePointerId === event.pointerId) {
        track.releasePointerCapture(event.pointerId);
        swipePointerId = null;
      }
    };

    track.addEventListener("pointerup", endSwipe);
    track.addEventListener("pointercancel", endSwipe);

    document.addEventListener("keydown", (event) => {
      if (!overlay?.classList.contains("is-open")) return;
      if (event.key === "Escape") closeStories();
      if (event.key === "ArrowLeft") moveMedia(-1);
      if (event.key === "ArrowRight") moveMedia(1);
    });

    window.addEventListener("popstate", (event) => {
      if (!overlay?.classList.contains("is-open")) return;
      if (event.state?.stories) return;
      closeStories({ fromPopState: true });
    });
  };

  const clearTimeoutFor = (container) => {
    const current = mediaTimeouts.get(container);
    if (current) {
      clearTimeout(current);
      mediaTimeouts.delete(container);
    }
  };

  const clearAllTimeouts = () => {
    mediaTimeouts.forEach((timer) => clearTimeout(timer));
    mediaTimeouts.clear();
  };

  const setTimeoutFor = (container, onTimeout) => {
    clearTimeoutFor(container);
    const timer = setTimeout(onTimeout, LOAD_TIMEOUT);
    mediaTimeouts.set(container, timer);
  };

  const showPlaceholder = (container, text) => {
    container.innerHTML = `
      <div class="stories-overlay__fallback">
        <div class="stories-overlay__status">${text}</div>
      </div>
    `;
  };

  const showFallback = (container, story, media, reason, retry) => {
    const poster = media?.posterUrl || "";
    container.innerHTML = `
      <div class="stories-overlay__fallback">
        ${poster ? `<img src="${poster}" alt="${story.title || "Воспоминание"}" loading="lazy" />` : ""}
        <div class="stories-overlay__status">Не удалось загрузить</div>
        <button class="stories-overlay__retry" type="button">Повторить</button>
      </div>
    `;
    log("fallback", { id: story.id, reason });
    container.querySelector(".stories-overlay__retry")?.addEventListener("click", () => retry(container));
  };

  const loadImage = (container, story, media, src, eager) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    img.alt = story.title || "Воспоминание";
    img.onload = () => {
      clearTimeoutFor(container);
      container.dataset.loaded = "1";
      container.innerHTML = "";
      container.appendChild(img);
      log("image:loaded", { id: story.id, src });
    };
    img.onerror = () => {
      clearTimeoutFor(container);
      showFallback(container, story, media, "image-error", (target) => loadImage(target, story, media, src, true));
    };
    img.src = src;
  };

  const loadVideo = (container, story, media, src, eager, isActive) => {
    if (!src) {
      clearTimeoutFor(container);
      showFallback(container, story, media, "video-no-src", (target) => loadVideo(target, story, media, src, true, true));
      return;
    }
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.preload = eager ? "metadata" : "none";
    if (media?.posterUrl) video.poster = media.posterUrl;
    container.appendChild(video);
    video.addEventListener("loadeddata", () => {
      clearTimeoutFor(container);
      container.dataset.loaded = "1";
      container.querySelector(".stories-overlay__spinner")?.remove();
      log("video:loaded", { id: story.id, src });
      if (isActive) {
        video.play().catch(() => {});
      }
    });
    video.addEventListener("canplay", () => {
      clearTimeoutFor(container);
      container.dataset.loaded = "1";
      container.querySelector(".stories-overlay__spinner")?.remove();
    });
    video.addEventListener("error", () => {
      clearTimeoutFor(container);
      showFallback(container, story, media, "video-error", (target) => loadVideo(target, story, media, src, true, true));
    });
    video.src = src;
    video.load();
  };

  const renderMedia = (container, story, media, shouldLoad, isActive) => {
    if (!media?.mediaUrl) {
      container.dataset.loaded = "1";
      showPlaceholder(container, "Контент будет добавлен позже");
      return;
    }

    if (!shouldLoad) {
      container.dataset.loaded = "0";
      container.innerHTML = media.posterUrl
        ? `<img src="${media.posterUrl}" alt="${story.title || "Воспоминание"}" loading="lazy" />`
        : `<div class="stories-overlay__placeholder"></div>`;
      return;
    }

    if (container.dataset.loaded === "1" && container.dataset.src === media.mediaUrl) {
      return;
    }

    container.dataset.loaded = "0";
    container.dataset.src = media.mediaUrl;
    container.innerHTML = `<div class="stories-overlay__spinner" aria-hidden="true"></div>`;

    setTimeoutFor(container, () => {
      const retry = (target) => {
        const bust = `v=${Date.now()}`;
        const nextSrc = media.mediaUrl.includes("?") ? `${media.mediaUrl}&${bust}` : `${media.mediaUrl}?${bust}`;
        if (media.mediaType === "video") {
          loadVideo(target, story, media, nextSrc, true, true);
        } else {
          loadImage(target, story, media, nextSrc, true);
        }
      };
      showFallback(container, story, media, "timeout", retry);
    });

    if (media.mediaType === "video") {
      loadVideo(container, story, media, media.mediaUrl, isActive, isActive);
    } else {
      loadImage(container, story, media, media.mediaUrl, isActive);
    }
  };

  const updateWindow = () => {
    if (!track) return;
    const cards = Array.from(track.querySelectorAll(".stories-overlay__item"));
    cards.forEach((card) => {
      const index = Number(card.dataset.index);
      const story = items[index];
      if (!story) return;
      const media = card.querySelector(".stories-overlay__media");
      if (!media) return;
      const isActiveStory = index === activeStoryIndex;
      const mediaIndex = isActiveStory ? story.activeMediaIndex : 0;
      const currentMedia = story.media[mediaIndex] || story.media[0];
      const shouldLoad = isActiveStory && Math.abs(mediaIndex - story.activeMediaIndex) <= WINDOW_SIZE;
      renderMedia(media, story, currentMedia, shouldLoad, isActiveStory);
    });
  };

  const updateProgress = () => {
    if (!progress) return;
    progress.innerHTML = "";
    const story = items[activeStoryIndex];
    const total = story?.media?.length || 0;
    const activeMediaIndex = story?.activeMediaIndex || 0;
    for (let i = 0; i < Math.max(total, 1); i += 1) {
      const segment = document.createElement("span");
      segment.className = "stories-overlay__segment";
      if (i === activeMediaIndex) segment.classList.add("is-active");
      if (i < activeMediaIndex) segment.classList.add("is-done");
      progress.appendChild(segment);
    }
  };

  const pauseAllVideos = () => {
    track.querySelectorAll("video").forEach((video) => video.pause());
  };

  const setActiveMedia = (index) => {
    const story = items[activeStoryIndex];
    if (!story) return;
    const nextIndex = Math.max(0, Math.min(index, story.media.length - 1));
    story.activeMediaIndex = nextIndex;
    updateWindow();
    updateProgress();
    pauseAllVideos();
    const activeCard = track.querySelector(`[data-index="${activeStoryIndex}"]`);
    activeCard?.querySelector("video")?.play().catch(() => {});
  };

  const setActiveStory = (index) => {
    const nextStoryIndex = Math.max(0, Math.min(index, items.length - 1));
    activeStoryIndex = nextStoryIndex;
    const story = items[activeStoryIndex];
    if (story && !Number.isFinite(story.activeMediaIndex)) {
      story.activeMediaIndex = 0;
    }
    updateWindow();
    updateProgress();
    pauseAllVideos();
    const activeCard = track.querySelector(`[data-index="${activeStoryIndex}"]`);
    activeCard?.querySelector("video")?.play().catch(() => {});
  };

  const scrollBy = (direction) => {
    if (!track) return;
    const next = Math.max(0, Math.min(activeStoryIndex + direction, items.length - 1));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  const moveMedia = (direction) => {
    const story = items[activeStoryIndex];
    if (!story) return;
    const nextMediaIndex = story.activeMediaIndex + direction;
    if (nextMediaIndex >= 0 && nextMediaIndex < story.media.length) {
      setActiveMedia(nextMediaIndex);
      return;
    }
    const nextStory = activeStoryIndex + direction;
    if (nextStory < 0 || nextStory >= items.length) return;
    const targetMediaIndex = direction > 0 ? 0 : (items[nextStory].media.length - 1);
    items[nextStory].activeMediaIndex = Math.max(0, targetMediaIndex);
    scrollBy(direction);
    setActiveStory(nextStory);
    setActiveMedia(items[nextStory].activeMediaIndex);
  };

  const buildOverlayItems = () => {
    if (!track || !progress) return;
    track.innerHTML = "";
    progress.innerHTML = "";
    items.forEach((story, index) => {
      const item = document.createElement("section");
      item.className = "stories-overlay__item";
      item.dataset.index = String(index);
      item.innerHTML = `
        <div class="stories-overlay__card">
          <div class="stories-overlay__media"></div>
          <div class="stories-overlay__meta">
            <strong>${story.title || "Воспоминание"}</strong>
            <p>${story.caption || ""}</p>
          </div>
        </div>
      `;
      track.appendChild(item);
    });
  };

  const openStories = (index) => {
    createOverlay();
    items = collectStories();
    if (!items.length) return;
    buildOverlayItems();
    scrollY = window.scrollY;
    overlay.classList.add("is-open");
    overlay.removeAttribute("aria-hidden");
    document.body.classList.add("body--locked");
    requestAnimationFrame(() => {
      track.scrollLeft = track.clientWidth * index;
      setActiveStory(index);
      setActiveMedia(items[index]?.activeMediaIndex || 0);
    });

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.index);
          if (Number.isFinite(idx)) {
            setActiveStory(idx);
            setActiveMedia(items[idx]?.activeMediaIndex || 0);
          }
        });
      },
      { root: track, threshold: VISIBILITY_THRESHOLD }
    );
    track.querySelectorAll(".stories-overlay__item").forEach((item) => observer.observe(item));

    historyActive = true;
    if (!history.state?.stories) {
      history.pushState({ stories: true, index }, "");
    }
  };

  const closeStories = ({ fromPopState = false } = {}) => {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    if (closing) return;
    closing = true;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("body--locked");
    window.scrollTo({ top: scrollY, behavior: "auto" });
    track?.querySelectorAll("video").forEach((video) => video.pause());
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    clearAllTimeouts();
    if (!fromPopState && historyActive && history.state?.stories) {
      history.back();
    }
    historyActive = false;
    overlay.remove();
    overlay = null;
    track = null;
    progress = null;
    closing = false;
  };

  const bindThumbs = () => {
    document.addEventListener("click", (event) => {
      const thumb = event.target.closest(STORY_SELECTOR);
      if (!thumb) return;
      const index = Array.from(document.querySelectorAll(STORY_SELECTOR)).indexOf(thumb);
      if (index < 0) return;
      openStories(index);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindThumbs);
  } else {
    bindThumbs();
  }
})();
