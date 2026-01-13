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
  let activeIndex = 0;
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

  const collectStories = () => {
    const nodes = Array.from(document.querySelectorAll(STORY_SELECTOR));
    return nodes
      .map((node) => {
        const mediaUrl = node.dataset.mediaUrl || node.dataset.mediaSrc || "";
        const mediaType = normalizeMediaType(node.dataset.mediaType);
        const posterUrl = node.dataset.posterUrl || node.dataset.poster || "";
        const title = node.dataset.title || "";
        const caption = node.dataset.caption || node.dataset.subtitle || "";
        const img = node.querySelector("img");
        const fallbackPoster = posterUrl || img?.getAttribute("data-src") || img?.getAttribute("src") || "";
        return {
          id: node.dataset.storyId || "",
          mediaUrl,
          mediaType,
          posterUrl: fallbackPoster,
          title,
          caption,
        };
      })
      .filter((item) => item.mediaUrl || item.posterUrl);
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

    overlay.addEventListener("click", (event) => {
      if (event.target.closest("[data-stories-close]")) {
        closeStories();
      }
      if (event.target.closest("[data-stories-prev]")) {
        scrollBy(-1);
      }
      if (event.target.closest("[data-stories-next]")) {
        scrollBy(1);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!overlay?.classList.contains("is-open")) return;
      if (event.key === "Escape") closeStories();
      if (event.key === "ArrowLeft") scrollBy(-1);
      if (event.key === "ArrowRight") scrollBy(1);
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

  const showFallback = (container, story, reason, retry) => {
    const poster = story.posterUrl || "";
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

  const loadImage = (container, story, src, eager) => {
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
      showFallback(container, story, "image-error", (target) => loadImage(target, story, src, true));
    };
    img.src = src;
  };

  const loadVideo = (container, story, src, eager, isActive) => {
    if (!src) {
      clearTimeoutFor(container);
      showFallback(container, story, "video-no-src", (target) => loadVideo(target, story, src, true, true));
      return;
    }
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.preload = eager ? "metadata" : "none";
    if (story.posterUrl) video.poster = story.posterUrl;
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
      showFallback(container, story, "video-error", (target) => loadVideo(target, story, src, true, true));
    });
    video.src = src;
    video.load();
  };

  const renderMedia = (container, story, shouldLoad, isActive) => {
    if (!story.mediaUrl) {
      container.dataset.loaded = "1";
      showPlaceholder(container, "Контент будет добавлен позже");
      return;
    }

    if (!shouldLoad) {
      container.dataset.loaded = "0";
      container.innerHTML = story.posterUrl
        ? `<img src="${story.posterUrl}" alt="${story.title || "Воспоминание"}" loading="lazy" />`
        : `<div class="stories-overlay__placeholder"></div>`;
      return;
    }

    if (container.dataset.loaded === "1" && container.dataset.src === story.mediaUrl) {
      return;
    }

    container.dataset.loaded = "0";
    container.dataset.src = story.mediaUrl;
    container.innerHTML = `<div class="stories-overlay__spinner" aria-hidden="true"></div>`;

    setTimeoutFor(container, () => {
      const retry = (target) => {
        const bust = `v=${Date.now()}`;
        const nextSrc = story.mediaUrl.includes("?") ? `${story.mediaUrl}&${bust}` : `${story.mediaUrl}?${bust}`;
        if (story.mediaType === "video") {
          loadVideo(target, story, nextSrc, true, true);
        } else {
          loadImage(target, story, nextSrc, true);
        }
      };
      showFallback(container, story, "timeout", retry);
    });

    if (story.mediaType === "video") {
      loadVideo(container, story, story.mediaUrl, isActive, isActive);
    } else {
      loadImage(container, story, story.mediaUrl, isActive);
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
      const shouldLoad = Math.abs(index - activeIndex) <= WINDOW_SIZE;
      renderMedia(media, story, shouldLoad, index === activeIndex);
    });
  };

  const updateProgress = () => {
    if (!progress) return;
    progress.querySelectorAll(".stories-overlay__segment").forEach((segment, index) => {
      segment.classList.toggle("is-active", index === activeIndex);
      segment.classList.toggle("is-done", index < activeIndex);
    });
  };

  const setActiveIndex = (index) => {
    activeIndex = Math.max(0, Math.min(index, items.length - 1));
    updateWindow();
    updateProgress();
    track.querySelectorAll("video").forEach((video) => {
      if (video.closest(`[data-index="${activeIndex}"]`)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const scrollBy = (direction) => {
    if (!track) return;
    const next = Math.max(0, Math.min(activeIndex + direction, items.length - 1));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
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

      const segment = document.createElement("span");
      segment.className = "stories-overlay__segment";
      progress.appendChild(segment);
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
      setActiveIndex(index);
    });

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.index);
          if (Number.isFinite(idx)) setActiveIndex(idx);
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
