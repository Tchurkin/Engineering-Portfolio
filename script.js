const year = document.getElementById("year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const revealItems = document.querySelectorAll(".reveal");
const isDevPage = document.querySelector(".dev-log-grid") !== null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (isDevPage) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window && revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const devEntries = document.querySelectorAll(".dev-entry");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const network = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const isConstrainedConnection =
  !!network &&
  (network.saveData === true || ["slow-2g", "2g", "3g"].includes(network.effectiveType));

const scrollScrubVideos = document.querySelectorAll("video[data-scroll-scrub]");

if (scrollScrubVideos.length > 0) {
  scrollScrubVideos.forEach((video) => {
    const section = video.closest(".scroll-scrub-banner");
    if (!section) {
      return;
    }

    video.pause();

    if (prefersReducedMotion) {
      return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const clamp01 = (value) => clamp(value, 0, 1);
    const getTargetProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollSpan = Math.max(section.offsetHeight - window.innerHeight, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), scrollSpan);
      return clamp01(traveled / scrollSpan);
    };

    let targetProgress = 0;
    let smoothProgress = 0;
    let rafId = 0;
    let lastTs = 0;
    let startTime = 0;
    const scrubConfig = {
      smoothingHz: 20,
      catchupHz: 32,
      settleEpsilonProgress: 0.0005,
      settleEpsilonTime: 0.006,
      minStep: 0.03,
      maxStep: 0.2,
      stepRatio: 0.018,
      catchupThreshold: 0.08,
      hardSeekThresholdSeconds: 0.35,
    };

    const renderScrub = (ts) => {
      rafId = 0;

      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
      lastTs = ts;

      // Time-based smoothing keeps motion consistent across devices/frame rates.
      const hz =
        Math.abs(targetProgress - smoothProgress) > scrubConfig.catchupThreshold
          ? scrubConfig.catchupHz
          : scrubConfig.smoothingHz;
      const smoothing = 1 - Math.exp(-hz * dt);
      smoothProgress += (targetProgress - smoothProgress) * smoothing;

      if (Math.abs(targetProgress - smoothProgress) < scrubConfig.settleEpsilonProgress) {
        smoothProgress = targetProgress;
      }

      const scrubDuration = Math.max(video.duration - startTime, 0);
      const desiredTime = startTime + smoothProgress * scrubDuration;
      const delta = desiredTime - video.currentTime;

      if (Math.abs(delta) > scrubConfig.hardSeekThresholdSeconds && !video.seeking) {
        video.currentTime = desiredTime;
      }

      // Bound each seek step so we do not thrash decoder/keyframe seeks.
      const maxStep = clamp(
        video.duration * scrubConfig.stepRatio,
        scrubConfig.minStep,
        scrubConfig.maxStep
      );
      const nextTime = video.currentTime + clamp(delta, -maxStep, maxStep);

      if (Math.abs(delta) > scrubConfig.settleEpsilonTime && !video.seeking) {
        if (typeof video.fastSeek === "function") {
          video.fastSeek(nextTime);
        } else {
          video.currentTime = nextTime;
        }
      }

      if (
        Math.abs(targetProgress - smoothProgress) > scrubConfig.settleEpsilonProgress ||
        Math.abs(delta) > scrubConfig.settleEpsilonTime
      ) {
        rafId = window.requestAnimationFrame(renderScrub);
      }
    };

    const requestScrubUpdate = () => {
      targetProgress = getTargetProgress();
      if (!rafId) {
        rafId = window.requestAnimationFrame(renderScrub);
      }
    };

    video.addEventListener(
      "loadedmetadata",
      () => {
        const configuredStart = Number.parseFloat(video.dataset.startTime || "0");
        startTime = Number.isFinite(configuredStart)
          ? clamp(configuredStart, 0, Math.max(video.duration - 0.001, 0))
          : 0;

        if (video.duration > 0) {
          video.currentTime = startTime;
        }
        requestScrubUpdate();
      },
      { once: true }
    );
    window.addEventListener("scroll", requestScrubUpdate, { passive: true });
    window.addEventListener("resize", requestScrubUpdate);
    requestScrubUpdate();
  });
}

const applyPlaybackRate = (video) => {
  if (!video) {
    return;
  }

  const rate = Number.parseFloat(video.dataset.playbackRate || "1");
  if (!Number.isFinite(rate) || rate <= 0) {
    return;
  }

  video.playbackRate = rate;
};

const hydrateEntryMedia = (entry) => {
  if (!entry || entry.dataset.mediaHydrated === "true") {
    return;
  }

  const images = entry.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    const src = img.getAttribute("data-src");
    if (src) {
      img.src = src;
      img.removeAttribute("data-src");
    }
  });

  const sources = entry.querySelectorAll("source[data-src]");
  sources.forEach((source) => {
    const src = source.getAttribute("data-src");
    if (src) {
      source.src = src;
      source.removeAttribute("data-src");
    }
  });

  const video = entry.querySelector("video");
  if (video && sources.length > 0) {
    video.load();
  }

  if (video) {
    applyPlaybackRate(video);
    video.addEventListener("loadedmetadata", () => applyPlaybackRate(video), { once: true });
  }

  entry.dataset.mediaHydrated = "true";
};

if (devEntries.length > 0) {
  devEntries.forEach((entry) => hydrateEntryMedia(entry));
}

if (devEntries.length > 0 && canHover) {
  const startPreview = (entry) => {
    entry.classList.add("is-hovered");
    hydrateEntryMedia(entry);

    if (prefersReducedMotion || isConstrainedConnection) {
      return;
    }

    const video = entry.querySelector("video");
    if (!video) {
      return;
    }

    applyPlaybackRate(video);
    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Ignore autoplay blocks; controls are still available.
      });
    }
  };

  const stopPreview = (entry) => {
    entry.classList.remove("is-hovered");

    const video = entry.querySelector("video");
    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  };

  devEntries.forEach((entry) => {
    entry.addEventListener("pointerenter", () => startPreview(entry));
    entry.addEventListener("pointerleave", () => stopPreview(entry));
    entry.addEventListener("focusin", () => startPreview(entry));
    entry.addEventListener("focusout", () => stopPreview(entry));
  });
}
