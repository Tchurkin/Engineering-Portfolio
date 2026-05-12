const year = document.getElementById("year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const revealItems = document.querySelectorAll(".reveal");
const isDevPage = document.querySelector(".dev-log-grid") !== null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (document.body.classList.contains("page-home")) {
  const variantClassMap = {
    a: "home-variant-a",
    b: "home-variant-b",
    c: "home-variant-c",
    d: "home-variant-d",
    e: "home-variant-e",
    f: "home-variant-f",
    g: "home-variant-g",
  };
  const params = new URLSearchParams(window.location.search);
  const currentVariantClass =
    Object.values(variantClassMap).find((variantClass) =>
      document.body.classList.contains(variantClass)
    ) || "home-variant-g";
  const selectedVariant = params.get("hero");
  const resolvedVariantClass = selectedVariant
    ? (variantClassMap[selectedVariant.toLowerCase()] || currentVariantClass)
    : currentVariantClass;

  document.body.classList.remove(
    "home-variant-a",
    "home-variant-b",
    "home-variant-c",
    "home-variant-d",
    "home-variant-e",
    "home-variant-f",
    "home-variant-g"
  );
  document.body.classList.add(resolvedVariantClass);
}

const homeHeroBanner = document.querySelector(".home-hero-banner");
const homeHeroTitle = document.querySelector(".page-home .hero.hero-detached");
const homeMain = document.querySelector(".page-home main");
const homeTopBoxes = document.querySelectorAll(".page-home .hero.hero-detached, .page-home #projects.panel");
if (!prefersReducedMotion && homeHeroBanner) {
  const homeTopBaseOffset = -110;
  const homeTitleBaseOffset = -40;
  const homeParallaxSnapEpsilon = 0.24;
  let homeHeroParallaxRaf = 0;
  let targetHomeParallax = 0;
  let currentHomeParallax = 0;
  let targetHomeBaseParallax = 0;
  let currentHomeBaseParallax = 0;
  let targetHomeTopParallax = homeTopBaseOffset;
  let currentHomeTopParallax = homeTopBaseOffset;
  let targetHomeTitleParallax = homeTitleBaseOffset;
  let currentHomeTitleParallax = homeTitleBaseOffset;

  const updateHomeHeroParallax = () => {
    homeHeroParallaxRaf = 0;

    currentHomeParallax += (targetHomeParallax - currentHomeParallax) * 0.52;
    currentHomeBaseParallax += (targetHomeBaseParallax - currentHomeBaseParallax) * 0.5;
    currentHomeTopParallax += (targetHomeTopParallax - currentHomeTopParallax) * 0.46;
    currentHomeTitleParallax += (targetHomeTitleParallax - currentHomeTitleParallax) * 0.46;
    if (Math.abs(targetHomeParallax - currentHomeParallax) < homeParallaxSnapEpsilon) {
      currentHomeParallax = targetHomeParallax;
    }
    if (Math.abs(targetHomeBaseParallax - currentHomeBaseParallax) < homeParallaxSnapEpsilon) {
      currentHomeBaseParallax = targetHomeBaseParallax;
    }
    if (Math.abs(targetHomeTopParallax - currentHomeTopParallax) < homeParallaxSnapEpsilon) {
      currentHomeTopParallax = targetHomeTopParallax;
    }
    if (Math.abs(targetHomeTitleParallax - currentHomeTitleParallax) < homeParallaxSnapEpsilon) {
      currentHomeTitleParallax = targetHomeTitleParallax;
    }

    homeHeroBanner.style.setProperty("--home-hero-parallax", `${currentHomeParallax.toFixed(2)}px`);
    if (homeMain) {
      homeMain.style.setProperty("--home-base-parallax", `${currentHomeBaseParallax.toFixed(2)}px`);
    }
    homeTopBoxes.forEach((box) => {
      box.style.setProperty("--home-top-parallax", `${currentHomeTopParallax.toFixed(2)}px`);
    });
    if (homeHeroTitle) {
      homeHeroTitle.style.setProperty("--home-title-parallax", `${currentHomeTitleParallax.toFixed(2)}px`);
    }

    if (
      Math.abs(targetHomeParallax - currentHomeParallax) >= homeParallaxSnapEpsilon ||
      Math.abs(targetHomeBaseParallax - currentHomeBaseParallax) >= homeParallaxSnapEpsilon ||
      Math.abs(targetHomeTopParallax - currentHomeTopParallax) >= homeParallaxSnapEpsilon ||
      Math.abs(targetHomeTitleParallax - currentHomeTitleParallax) >= homeParallaxSnapEpsilon
    ) {
      homeHeroParallaxRaf = requestAnimationFrame(updateHomeHeroParallax);
    }
  };

  const requestHomeHeroParallax = () => {
    const nextTarget = Math.max(Math.min(window.scrollY * 0.3, 180), 0);
    targetHomeParallax = nextTarget;
    targetHomeBaseParallax = Math.max(Math.min(window.scrollY * 0.045, 38), 0);
    targetHomeTopParallax = homeTopBaseOffset + Math.max(Math.min(window.scrollY * 0.09, 70), 0);
    targetHomeTitleParallax = homeTitleBaseOffset + Math.max(Math.min(window.scrollY * 0.038, 30), 0);
    if (!homeHeroParallaxRaf) {
      homeHeroParallaxRaf = requestAnimationFrame(updateHomeHeroParallax);
    }
  };

  window.addEventListener("scroll", requestHomeHeroParallax, { passive: true });
  window.addEventListener("resize", requestHomeHeroParallax);
  requestHomeHeroParallax();
}

const getBottomFadeOverlay = () => {
  let overlay = document.querySelector(".scroll-bottom-fade");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "scroll-bottom-fade";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }
  return overlay;
};

const bottomFadeOverlay = getBottomFadeOverlay();

const updateBottomViewportFade = () => {
  const hasMoreBelow =
    window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 6;
  bottomFadeOverlay.classList.toggle("is-visible", hasMoreBelow);
};

const updateRevealOpacities = () => {
  const vh = window.innerHeight;
  revealItems.forEach((el) => {
    const isHomeLayerElement =
      document.body.classList.contains("page-home") &&
      (el.matches(".hero.hero-detached") || el.matches("#projects.panel"));
    if (isHomeLayerElement) {
      el.style.opacity = 1;
      return;
    }

    const rect = el.getBoundingClientRect();
    // Fade in: bottom 15% of viewport -> fully visible
    const fadeInZone = vh * 0.15;
    const fadeInProgress = Math.min(Math.max((vh - rect.top - fadeInZone) / fadeInZone, 0), 1);
    el.style.opacity = 1;
    el.style.transform = `translateY(${(1 - fadeInProgress) * 14}px)`;
  });
};

if (isDevPage) {
  revealItems.forEach((item) => { item.style.opacity = 1; item.style.transform = "none"; });
} else {
  updateRevealOpacities();
  window.addEventListener("scroll", updateRevealOpacities, { passive: true });
  window.addEventListener("resize", updateRevealOpacities);
}

updateBottomViewportFade();
window.addEventListener("scroll", updateBottomViewportFade, { passive: true });
window.addEventListener("resize", updateBottomViewportFade);

const aboutBgTrack = document.querySelector(".about-scrub-track");
if (!prefersReducedMotion && aboutBgTrack) {
  let bgParallaxRaf = 0;
  const aboutParallaxSnapEpsilon = 0.24;
  let targetBgOffset = window.scrollY * -0.15;
  let currentBgOffset = targetBgOffset;

  const updateAboutBgParallax = () => {
    bgParallaxRaf = 0;

    currentBgOffset += (targetBgOffset - currentBgOffset) * 0.72;
    if (Math.abs(targetBgOffset - currentBgOffset) < aboutParallaxSnapEpsilon) {
      currentBgOffset = targetBgOffset;
    }

    aboutBgTrack.style.setProperty("--about-bg-parallax", `${currentBgOffset.toFixed(2)}px`);

    if (Math.abs(targetBgOffset - currentBgOffset) >= aboutParallaxSnapEpsilon) {
      bgParallaxRaf = requestAnimationFrame(updateAboutBgParallax);
    }
  };

  const requestBgParallax = () => {
    targetBgOffset = window.scrollY * -0.15;
    if (!bgParallaxRaf) bgParallaxRaf = requestAnimationFrame(updateAboutBgParallax);
  };

  window.addEventListener("scroll", requestBgParallax, { passive: true });
  window.addEventListener("resize", requestBgParallax);
  requestBgParallax();
}

const parallaxItems = document.querySelectorAll("[data-parallax]");
if (!prefersReducedMotion && parallaxItems.length > 0) {
  let parallaxRaf = 0;
  const parallaxStrengths = Array.from(parallaxItems, (el) =>
    Number.parseFloat(el.dataset.parallaxStrength || "0.08")
  );

  const updateParallax = () => {
    parallaxRaf = 0;
    const vh = Math.max(window.innerHeight, 1);
    const viewportCenter = vh / 2;

    parallaxItems.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) {
        return;
      }
      const elCenter = rect.top + rect.height / 2;
      const delta = (elCenter - viewportCenter) / vh;
      const strength = parallaxStrengths[index];
      const clamped = Math.max(Math.min(delta, 0.8), -0.8);
      const y = clamped * strength * -220;
      el.style.setProperty("--about-parallax-y", `${y.toFixed(2)}px`);
    });
  };

  const requestParallax = () => {
    if (!parallaxRaf) {
      parallaxRaf = window.requestAnimationFrame(updateParallax);
    }
  };

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
  requestParallax();
}

const devEntries = document.querySelectorAll(".dev-entry");
const devPagination = document.querySelector("[data-dev-pagination]");
const devPageList = document.querySelector("[data-dev-page-list]");
const projectCards = document.querySelectorAll(".project-card");
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

    const canvas = section.querySelector("[data-scroll-scrub-canvas]");
    const track = section.querySelector(".scroll-scrub-track");
    const framePattern = video.dataset.framePattern || "";
    const frameCount = Number.parseInt(video.dataset.frameCount || "0", 10);
    const frameDigits = Number.parseInt(video.dataset.frameDigits || "4", 10);

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const clamp01 = (value) => clamp(value, 0, 1);
    const configuredScrubSpeed = Number.parseFloat(video.dataset.scrubSpeed || "2.2");
    const scrubSpeed = Number.isFinite(configuredScrubSpeed)
      ? clamp(configuredScrubSpeed, 0.5, 6)
      : 2.2;
    const configuredVideoProgressExponent = Number.parseFloat(
      video.dataset.videoProgressExponent || "1"
    );
    const videoProgressExponent = Number.isFinite(configuredVideoProgressExponent)
      ? clamp(configuredVideoProgressExponent, 0.6, 3)
      : 1;
    const configuredVideoProgressMix = Number.parseFloat(video.dataset.videoProgressMix || "1");
    const videoProgressMix = Number.isFinite(configuredVideoProgressMix)
      ? clamp(configuredVideoProgressMix, 0, 1)
      : 1;
    const scrubMode = video.dataset.scrubMode || "section";
    const configuredPhaseOneShare = Number.parseFloat(video.dataset.phaseOneShare || "0.2");
    let phaseOneShare = Number.isFinite(configuredPhaseOneShare)
      ? clamp(configuredPhaseOneShare, 0.03, 0.95)
      : 0.2;
    const scrubStartScrollY = window.scrollY;
    const getSectionProgress = () => {
      const vh = Math.max(window.innerHeight, 1);
      const travelWindow = Math.max(section.offsetHeight - vh, 1);
      const traveled = clamp(window.scrollY - scrubStartScrollY, 0, travelWindow);
      return clamp01(traveled / travelWindow);
    };

    const getPageSplitProgress = () => {
      const vh = Math.max(window.innerHeight, 1);
      const sectionWindow = Math.max(section.offsetHeight - vh, 1);
      const pageBottomY = Math.max(document.documentElement.scrollHeight - vh, scrubStartScrollY + 1);
      const totalWindow = Math.max(pageBottomY - scrubStartScrollY, 1);
      const traveled = clamp(window.scrollY - scrubStartScrollY, 0, totalWindow);

      if (traveled <= sectionWindow) {
        const local = clamp01(traveled / sectionWindow);
        return local * phaseOneShare;
      }

      const remainingWindow = Math.max(totalWindow - sectionWindow, 1);
      const local = clamp01((traveled - sectionWindow) / remainingWindow);
      return phaseOneShare + local * (1 - phaseOneShare);
    };

    const getTargetProgress = () => {
      if (scrubMode === "page-split") {
        return getPageSplitProgress();
      }

      return getSectionProgress();
    };

    const mapVideoProgress = (rawProgress) => {
      const clamped = clamp01(rawProgress);
      if (Math.abs(videoProgressExponent - 1) < 0.001 || videoProgressMix <= 0) {
        return clamped;
      }

      const powered = Math.pow(clamped, videoProgressExponent);
      return clamped * (1 - videoProgressMix) + powered * videoProgressMix;
    };

    if (canvas && framePattern.includes("{index}") && frameCount > 1) {
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (ctx) {
        let targetProgress = 0;
        let smoothProgress = 0;
        let rafId = 0;
        let lastTs = 0;
        let currentFrameIndex = 0;
        let lastDrawnIndex = -1;
        const frameCache = new Array(frameCount);
        const cachedIndices = new Set();
        const frameRetryCount = new Array(frameCount).fill(0);
        const failedFrames = new Set();
        const configuredLookahead = Number.parseInt(video.dataset.frameLookahead || "8", 10);
        const frameLookahead = Number.isFinite(configuredLookahead)
          ? clamp(configuredLookahead, 2, 20)
          : 8;
        const configuredMaxCached = Number.parseInt(video.dataset.maxCachedFrames || "260", 10);
        const maxCachedFrames = Number.isFinite(configuredMaxCached)
          ? clamp(configuredMaxCached, frameLookahead * 8, 520)
          : 260;
        const configuredMaxFrameRetries = Number.parseInt(video.dataset.maxFrameRetries || "2", 10);
        const maxFrameRetries = Number.isFinite(configuredMaxFrameRetries)
          ? clamp(configuredMaxFrameRetries, 0, 4)
          : 2;
        const scrubConfig = {
          smoothingHz: clamp(18 * scrubSpeed, 18, 96),
          catchupHz: clamp(32 * scrubSpeed, 32, 140),
          settleEpsilonProgress: 0.0005,
          catchupThreshold: 0.08,
        };

        const getFrameUrl = (index) => {
          const humanIndex = String(index + 1).padStart(frameDigits, "0");
          return framePattern.replace("{index}", humanIndex);
        };

        const resizeCanvas = () => {
          const layoutWidth = canvas.clientWidth;
          const layoutHeight = canvas.clientHeight;
          if (layoutWidth <= 0 || layoutHeight <= 0) {
            return;
          }

          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = Math.max(1, Math.round(layoutWidth * dpr));
          const height = Math.max(1, Math.round(layoutHeight * dpr));
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
        };

        const drawFrame = (index) => {
          if (index === lastDrawnIndex) {
            return true;
          }

          const img = frameCache[index];
          if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
            return false;
          }

          resizeCanvas();
          if (canvas.width <= 0 || canvas.height <= 0) {
            return false;
          }

          const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
          const drawWidth = img.naturalWidth * scale;
          const drawHeight = img.naturalHeight * scale;
          const drawX = (canvas.width - drawWidth) / 2;
          const drawY = (canvas.height - drawHeight) / 2;

          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          lastDrawnIndex = index;
          if (track) {
            track.classList.add("is-canvas-ready");
          }
          return true;
        };

        const pruneFrameCache = (centerIndex) => {
          if (cachedIndices.size <= maxCachedFrames) {
            return;
          }

          const overshoot = cachedIndices.size - maxCachedFrames;
          const farthestFirst = Array.from(cachedIndices).sort(
            (a, b) => Math.abs(b - centerIndex) - Math.abs(a - centerIndex)
          );

          for (let i = 0; i < overshoot; i += 1) {
            const index = farthestFirst[i];
            const img = frameCache[index];
            if (img) {
              img.src = "";
            }
            frameCache[index] = undefined;
            cachedIndices.delete(index);
          }
        };

        const loadFrame = (index) => {
          const safeIndex = clamp(index, 0, frameCount - 1);
          if (failedFrames.has(safeIndex)) {
            return;
          }

          const existing = frameCache[safeIndex];
          if (existing) {
            return;
          }

          const img = new Image();
          img.decoding = "async";
          img.src = getFrameUrl(safeIndex);
          img.onload = () => {
            frameRetryCount[safeIndex] = 0;
            cachedIndices.add(safeIndex);
            if (safeIndex === currentFrameIndex || lastDrawnIndex < 0) {
              drawFrame(safeIndex);
            }
          };
          img.onerror = () => {
            cachedIndices.delete(safeIndex);
            frameCache[safeIndex] = undefined;
            frameRetryCount[safeIndex] += 1;

            if (frameRetryCount[safeIndex] <= maxFrameRetries) {
              const retryDelay = 120 * frameRetryCount[safeIndex];
              window.setTimeout(() => {
                if (!failedFrames.has(safeIndex) && !frameCache[safeIndex]) {
                  loadFrame(safeIndex);
                }
              }, retryDelay);
              return;
            }

            failedFrames.add(safeIndex);
          };
          frameCache[safeIndex] = img;
        };

        const ensureFrame = (index) => {
          const safeIndex = clamp(index, 0, frameCount - 1);
          loadFrame(safeIndex);
          for (let offset = 1; offset <= frameLookahead; offset += 1) {
            loadFrame(safeIndex - offset);
            loadFrame(safeIndex + offset);
          }
          pruneFrameCache(safeIndex);
          return drawFrame(safeIndex);
        };

        const renderScrub = (ts) => {
          rafId = 0;

          const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
          lastTs = ts;

          const hz =
            Math.abs(targetProgress - smoothProgress) > scrubConfig.catchupThreshold
              ? scrubConfig.catchupHz
              : scrubConfig.smoothingHz;
          const smoothing = 1 - Math.exp(-hz * dt);
          smoothProgress += (targetProgress - smoothProgress) * smoothing;

          if (Math.abs(targetProgress - smoothProgress) < scrubConfig.settleEpsilonProgress) {
            smoothProgress = targetProgress;
          }

          currentFrameIndex = clamp(Math.round(smoothProgress * (frameCount - 1)), 0, frameCount - 1);
          const didDrawCurrent = ensureFrame(currentFrameIndex);

          if (
            Math.abs(targetProgress - smoothProgress) > scrubConfig.settleEpsilonProgress ||
            !didDrawCurrent ||
            lastDrawnIndex !== currentFrameIndex
          ) {
            rafId = window.requestAnimationFrame(renderScrub);
          }
        };

        const requestScrubUpdate = () => {
          const rawProgress = getTargetProgress();
          targetProgress = mapVideoProgress(rawProgress);
          section.style.setProperty("--scrub-progress", rawProgress.toFixed(4));
          if (!rafId) {
            rafId = window.requestAnimationFrame(renderScrub);
          }
        };

        ensureFrame(0);
        window.addEventListener("scroll", requestScrubUpdate, { passive: true });
        window.addEventListener("resize", () => {
          if (lastDrawnIndex >= 0) {
            drawFrame(lastDrawnIndex);
          } else {
            ensureFrame(currentFrameIndex);
          }
          requestScrubUpdate();
        });
        requestScrubUpdate();
        return;
      }
    }

    let targetProgress = 0;
    let smoothProgress = 0;
    let rafId = 0;
    let lastTs = 0;
    let startTime = 0;
    let endTime = 0;
    let lastIssuedTime = 0;
    let lastSeekAt = 0;
    const scrubConfig = {
      smoothingHz: clamp(18 * scrubSpeed, 18, 96),
      catchupHz: clamp(32 * scrubSpeed, 32, 140),
      settleEpsilonProgress: 0.0005,
      settleEpsilonTime: 0.006,
      minStep: 0.03,
      maxStep: 0.2,
      stepRatio: 0.018,
      catchupThreshold: 0.08,
      hardSeekThresholdSeconds: 0.35,
      targetFps: 30,
      minSeekIntervalMs: clamp(34 / scrubSpeed, 12, 34),
      minFrameDelta: clamp(0.75 / scrubSpeed, 0.2, 0.75),
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

      const scrubDuration = Math.max(endTime - startTime, 0);
      const frameDuration = 1 / Math.max(scrubConfig.targetFps, 1);
      const desiredTime = startTime + smoothProgress * scrubDuration;
      const snappedTime = clamp(
        Math.round(desiredTime / frameDuration) * frameDuration,
        startTime,
        endTime
      );
      const delta = snappedTime - video.currentTime;

      // Bound each seek step so we do not thrash decoder/keyframe seeks.
      const maxStep = clamp(
        video.duration * scrubConfig.stepRatio,
        scrubConfig.minStep,
        scrubConfig.maxStep
      );
      const needsHardSeek = Math.abs(delta) > scrubConfig.hardSeekThresholdSeconds;
      const nextTime = needsHardSeek
        ? snappedTime
        : clamp(video.currentTime + clamp(delta, -maxStep, maxStep), startTime, endTime);
      const timeSinceLastSeek = ts - lastSeekAt;
      const frameDelta = Math.abs(nextTime - lastIssuedTime);

      if (
        Math.abs(delta) > scrubConfig.settleEpsilonTime &&
        !video.seeking &&
        (needsHardSeek ||
          (timeSinceLastSeek >= scrubConfig.minSeekIntervalMs &&
            frameDelta >= frameDuration * scrubConfig.minFrameDelta))
      ) {
        if (typeof video.fastSeek === "function") {
          video.fastSeek(nextTime);
        } else {
          video.currentTime = nextTime;
        }

        lastIssuedTime = nextTime;
        lastSeekAt = ts;
      }

      if (
        Math.abs(targetProgress - smoothProgress) > scrubConfig.settleEpsilonProgress ||
        Math.abs(delta) > scrubConfig.settleEpsilonTime
      ) {
        rafId = window.requestAnimationFrame(renderScrub);
      }
    };

    const requestScrubUpdate = () => {
      const rawProgress = getTargetProgress();
      targetProgress = mapVideoProgress(rawProgress);
      section.style.setProperty("--scrub-progress", rawProgress.toFixed(4));
      if (!rafId) {
        rafId = window.requestAnimationFrame(renderScrub);
      }
    };

    video.addEventListener(
      "loadedmetadata",
      () => {
        const configuredStart = Number.parseFloat(video.dataset.startTime || "0");
        const configuredEnd = Number.parseFloat(video.dataset.endTime || "");
        const configuredPhaseOneSeconds = Number.parseFloat(video.dataset.phaseOneSeconds || "");
        startTime = Number.isFinite(configuredStart)
          ? clamp(configuredStart, 0, Math.max(video.duration - 0.001, 0))
          : 0;
        endTime = Number.isFinite(configuredEnd)
          ? clamp(configuredEnd, startTime + 0.001, Math.max(video.duration, startTime + 0.001))
          : Math.max(video.duration, startTime + 0.001);

        const scrubWindowDuration = Math.max(endTime - startTime, 0.001);

        if (
          scrubMode === "page-split" &&
          Number.isFinite(configuredPhaseOneSeconds) &&
          configuredPhaseOneSeconds > 0 &&
          scrubWindowDuration > 0
        ) {
          phaseOneShare = clamp(configuredPhaseOneSeconds / scrubWindowDuration, 0.03, 0.95);
        }

        if (video.duration > 0) {
          video.currentTime = startTime;
          lastIssuedTime = startTime;
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
  const entryList = Array.from(devEntries);
  let currentDevPage = 1;
  const getEntryLogNumber = (entry, fallback) => {
    const heading = entry.querySelector("h3");
    const match = heading ? heading.textContent.match(/(\d+)/) : null;
    if (!match) {
      return fallback;
    }

    const parsed = Number.parseInt(match[1], 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const bucketMap = new Map();
  entryList.forEach((entry, index) => {
    const fallbackLogNumber = entryList.length - index;
    const logNumber = Math.max(getEntryLogNumber(entry, fallbackLogNumber), 1);
    const bucketIndex = Math.floor((logNumber - 1) / 5);
    if (!bucketMap.has(bucketIndex)) {
      bucketMap.set(bucketIndex, []);
    }
    bucketMap.get(bucketIndex).push(entry);
  });

  const pageGroups = Array.from(bucketMap.keys())
    .sort((a, b) => b - a)
    .map((bucketIndex) => bucketMap.get(bucketIndex));
  const totalDevPages = Math.max(pageGroups.length, 1);

  const clampDevPage = (value) => Math.min(Math.max(value, 1), totalDevPages);
  const getVisibleEntries = () => entryList.filter((entry) => !entry.classList.contains("dev-entry--paged-hidden"));

  const entryNeedsExpandControl = (entry) => {
    const body = entry.querySelector(".dev-entry-body");
    if (!body) {
      return false;
    }

    const wasOpen = entry.classList.contains("is-open");
    if (wasOpen) {
      entry.classList.remove("is-open");
    }

    const needsControl = body.scrollHeight > body.clientHeight + 2;

    if (wasOpen) {
      entry.classList.add("is-open");
    }

    return needsControl;
  };

  const syncEntryExpandControl = (entry) => {
    const body = entry.querySelector(".dev-entry-body");
    if (!body) {
      return;
    }

    const existingBtn = entry.querySelector(".dev-expand-btn");
    const needsControl = entryNeedsExpandControl(entry);

    if (!needsControl) {
      entry.classList.add("no-expand");
      entry.classList.remove("is-open");
      if (existingBtn) {
        existingBtn.remove();
      }
      return;
    }

    entry.classList.remove("no-expand");

    if (existingBtn) {
      existingBtn.setAttribute("aria-expanded", String(entry.classList.contains("is-open")));
      return;
    }

    const expandBtn = document.createElement("button");
    expandBtn.className = "dev-expand-btn";
    expandBtn.type = "button";
    expandBtn.setAttribute("aria-label", "Toggle details");
    expandBtn.setAttribute("aria-expanded", "false");
    expandBtn.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 6 8 10 12 6"/></svg>';

    expandBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = entry.classList.toggle("is-open");
      expandBtn.setAttribute("aria-expanded", String(isOpen));
    });

    body.after(expandBtn);
  };

  devEntries.forEach((entry) => {
    const postLink = entry.querySelector(".project-link");
    if (!postLink || !postLink.href) {
      return;
    }

    entry.setAttribute("role", "link");
    entry.setAttribute("tabindex", "0");

    const openPost = () => {
      const target = postLink.getAttribute("target");
      if (target === "_blank") {
        window.open(postLink.href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = postLink.href;
    };

    syncEntryExpandControl(entry);

    entry.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) {
        return;
      }

      openPost();
    });

    entry.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openPost();
    });
  });

  const refreshDevEntryExpandControls = () => {
    getVisibleEntries().forEach((entry) => syncEntryExpandControl(entry));
  };

  const renderDevPagination = () => {
    if (!devPagination || !devPageList) {
      return;
    }

    if (totalDevPages <= 1) {
      devPagination.hidden = true;
      return;
    }

    devPagination.hidden = false;
    devPageList.innerHTML = "";
    for (let page = 1; page <= totalDevPages; page += 1) {
      const pageBtn = document.createElement("button");
      pageBtn.type = "button";
      pageBtn.className = "dev-page-btn";
      pageBtn.dataset.devPage = String(page);
      pageBtn.textContent = String(page);
      pageBtn.setAttribute("aria-label", `Page ${page}`);
      if (page === currentDevPage) {
        pageBtn.setAttribute("aria-current", "page");
      }
      devPageList.append(pageBtn);
    }

    const prevBtn = devPagination.querySelector('[data-dev-page="prev"]');
    const nextBtn = devPagination.querySelector('[data-dev-page="next"]');
    if (prevBtn) {
      prevBtn.disabled = currentDevPage === 1;
    }
    if (nextBtn) {
      nextBtn.disabled = currentDevPage === totalDevPages;
    }
  };

  const setDevPage = (page) => {
    currentDevPage = clampDevPage(page);
    const activeGroup = pageGroups[currentDevPage - 1] || entryList;

    entryList.forEach((entry) => {
      entry.hidden = true;
      entry.classList.add("dev-entry--paged-hidden");
      entry.style.display = "none";
      entry.classList.remove("is-open");
    });

    activeGroup.forEach((entry) => {
      entry.hidden = false;
      entry.classList.remove("dev-entry--paged-hidden");
      entry.style.display = "";
    });

    renderDevPagination();
    requestAnimationFrame(refreshDevEntryExpandControls);
  };

  if (devPagination) {
    devPagination.addEventListener("click", (event) => {
      const target = event.target.closest("[data-dev-page]");
      if (!target) {
        return;
      }

      const pageAction = target.dataset.devPage;
      if (pageAction === "prev") {
        setDevPage(currentDevPage - 1);
        return;
      }

      if (pageAction === "next") {
        setDevPage(currentDevPage + 1);
        return;
      }

      const pageNumber = Number.parseInt(pageAction, 10);
      if (!Number.isNaN(pageNumber)) {
        setDevPage(pageNumber);
      }
    });
  }

  window.addEventListener("resize", refreshDevEntryExpandControls);
  window.addEventListener("load", refreshDevEntryExpandControls);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshDevEntryExpandControls).catch(() => {});
  }

  setDevPage(1);
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
    video.loop = true;
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

    video.loop = false;
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

if (projectCards.length > 0) {
  projectCards.forEach((card) => {
    const projectLink = card.querySelector(".project-link");
    if (!projectLink || !projectLink.href) {
      return;
    }

    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    const openProject = () => {
      const target = projectLink.getAttribute("target");
      if (target === "_blank") {
        window.open(projectLink.href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = projectLink.href;
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) {
        return;
      }

      openProject();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openProject();
    });

    if (canHover) {
      card.addEventListener("pointerenter", () => card.classList.add("is-hovered"));
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width;
        const relY = (event.clientY - rect.top) / rect.height;
        const tiltY = (relX - 0.5) * 4;
        const tiltX = (0.5 - relY) * 4;
        card.style.setProperty("--tilt-rx", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-ry", `${tiltY.toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-hovered");
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
      });
      card.addEventListener("focusin", () => card.classList.add("is-hovered"));
      card.addEventListener("focusout", () => {
        card.classList.remove("is-hovered");
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
      });
    }
  });
}

const hoverPlayVideos = document.querySelectorAll("video[data-hover-play]");
if (hoverPlayVideos.length > 0 && canHover) {
  hoverPlayVideos.forEach((video) => {
    const attemptPlay = async () => {
      try {
        await video.play();
      } catch {
        // If autoplay with audio is blocked, retry muted.
        const wasMuted = video.muted;
        video.muted = true;
        try {
          await video.play();
        } catch {
          video.muted = wasMuted;
        }
      }
    };

    const stopPlay = () => {
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("pointerenter", () => {
      void attemptPlay();
    });

    video.addEventListener("pointerleave", stopPlay);
    video.addEventListener("focusin", () => {
      void attemptPlay();
    });
    video.addEventListener("focusout", stopPlay);
  });
}

const subsystemCards = document.querySelectorAll(".subsystem-card");
subsystemCards.forEach((card) => {
  const resetTilt = () => {
    card.style.setProperty("--tilt-rx", "0deg");
    card.style.setProperty("--tilt-ry", "0deg");
  };

  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const x = relX * 100;
    const y = relY * 100;
    const tiltY = (relX - 0.5) * 5;
    const tiltX = (0.5 - relY) * 5;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
    card.style.setProperty("--tilt-rx", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-ry", `${tiltY.toFixed(2)}deg`);
  });

  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("blur", resetTilt);
  resetTilt();
});

const cadScrubViews = document.querySelectorAll("[data-cad-scrub]");
cadScrubViews.forEach((view) => {
  const video = view.querySelector("[data-cad-video]");
  const canvas = view.querySelector("[data-cad-canvas]");
  const cadFrame = view.querySelector(".tvc-cad-frame");
  const progressBar = view.querySelector("[data-cad-progress]");
  if (!video && !canvas) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const framePattern = view.dataset.cadFramePattern || "";
  const frameCount = Number.parseInt(view.dataset.cadFrameCount || "0", 10);
  const frameDigits = Number.parseInt(view.dataset.cadFrameDigits || "4", 10);

  // Prefer frame-sequence canvas scrub for smoother interaction; keep video scrub as fallback.
  if (canvas && framePattern.includes("{index}") && frameCount > 1) {
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (ctx) {
      let pointerDown = false;
      let currentRatio = 0.5;
      let targetRatio = 0.5;
      let rafId = 0;
      let lastTs = 0;
      let currentFrameIndex = Math.round((frameCount - 1) * 0.5);
      let lastDrawnIndex = -1;
      const frameCache = new Array(frameCount);
      const failedFrames = new Set();
      const scrubConfig = {
        smoothingHz: 20,
        settleEpsilonRatio: 0.0008,
      };

      const setProgress = (ratio) => {
        const clamped = clamp(ratio, 0, 1);
        if (progressBar) {
          progressBar.style.width = `${(clamped * 100).toFixed(2)}%`;
        }
      };

      const getFrameUrl = (index) => {
        const humanIndex = String(index + 1).padStart(frameDigits, "0");
        return framePattern.replace("{index}", humanIndex);
      };

      const resizeCanvas = (img) => {
        if (!img) {
          return;
        }

        // Use layout dimensions instead of transformed bounds so rotation does not skew aspect math.
        const layoutWidth = canvas.clientWidth;
        const layoutHeight = canvas.clientHeight;
        if (layoutWidth <= 0 || layoutHeight <= 0) {
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(layoutWidth * dpr));
        const height = Math.max(1, Math.round(layoutHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      };

      const drawFrame = (index) => {
        const img = frameCache[index];
        if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
          return false;
        }

        resizeCanvas(img);
        if (canvas.width <= 0 || canvas.height <= 0) {
          return false;
        }

        const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        const drawX = (canvas.width - drawWidth) / 2;
        const drawY = (canvas.height - drawHeight) / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        lastDrawnIndex = index;
        if (cadFrame) {
          cadFrame.classList.add("is-canvas-ready");
        }
        return true;
      };

      const loadFrame = (index) => {
        const safeIndex = clamp(index, 0, frameCount - 1);
        if (failedFrames.has(safeIndex)) {
          return;
        }

        const existing = frameCache[safeIndex];
        if (existing) {
          return;
        }

        const img = new Image();
        img.decoding = "async";
        img.src = getFrameUrl(safeIndex);
        img.onload = () => {
          if (safeIndex === currentFrameIndex || lastDrawnIndex < 0) {
            drawFrame(safeIndex);
          }
        };
        img.onerror = () => {
          failedFrames.add(safeIndex);
        };
        frameCache[safeIndex] = img;
      };

      const ensureFrame = (index) => {
        const safeIndex = clamp(index, 0, frameCount - 1);
        loadFrame(safeIndex);
        loadFrame(safeIndex - 1);
        loadFrame(safeIndex + 1);
        loadFrame(safeIndex - 2);
        loadFrame(safeIndex + 2);
        drawFrame(safeIndex);
      };

      const prefetchAllFrames = () => {
        let next = 0;
        const pump = () => {
          const end = Math.min(next + 8, frameCount);
          for (let i = next; i < end; i += 1) {
            loadFrame(i);
          }
          next = end;
          if (next < frameCount) {
            window.setTimeout(pump, 45);
          }
        };
        pump();
      };

      const animateToTarget = (ts) => {
        rafId = 0;
        const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
        lastTs = ts;

        const delta = targetRatio - currentRatio;
        const smoothing = 1 - Math.exp(-scrubConfig.smoothingHz * dt);
        currentRatio += delta * smoothing;
        if (Math.abs(targetRatio - currentRatio) < scrubConfig.settleEpsilonRatio) {
          currentRatio = targetRatio;
        }

        setProgress(currentRatio);
        currentFrameIndex = clamp(Math.round(currentRatio * (frameCount - 1)), 0, frameCount - 1);
        ensureFrame(currentFrameIndex);

        if (Math.abs(targetRatio - currentRatio) > scrubConfig.settleEpsilonRatio) {
          rafId = window.requestAnimationFrame(animateToTarget);
        }
      };

      const queueProgress = (ratio) => {
        targetRatio = clamp(ratio, 0, 1);
        if (!rafId) {
          rafId = window.requestAnimationFrame(animateToTarget);
        }
      };

      const updateFromPointer = (clientX) => {
        const rect = view.getBoundingClientRect();
        const ratio = (clientX - rect.left) / Math.max(rect.width, 1);
        queueProgress(ratio);
      };

      if (video) {
        video.pause();
      }

      currentRatio = 0.5;
      targetRatio = 0.5;
      setProgress(0.5);
      ensureFrame(currentFrameIndex);
      prefetchAllFrames();

      window.addEventListener("resize", () => {
        if (lastDrawnIndex >= 0) {
          drawFrame(lastDrawnIndex);
        } else {
          ensureFrame(currentFrameIndex);
        }
      });

      view.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") {
          updateFromPointer(event.clientX);
        }
      });

      view.addEventListener("pointermove", (event) => {
        if (event.pointerType === "mouse" || pointerDown) {
          updateFromPointer(event.clientX);
        }
      });

      view.addEventListener("pointerdown", (event) => {
        pointerDown = true;
        updateFromPointer(event.clientX);
      });

      view.addEventListener("pointerup", () => {
        pointerDown = false;
      });

      view.addEventListener("pointerleave", () => {
        pointerDown = false;
      });

      return;
    }
  }

  let pointerDown = false;
  let currentRatio = 0.5;
  let targetRatio = 0.5;
  let rafId = 0;
  let lastTs = 0;
  let lastIssuedTime = 0;
  let lastSeekAt = 0;

  const scrubConfig = {
    smoothingHz: 18,
    settleEpsilonRatio: 0.0008,
    targetFps: 30,
    minSeekIntervalMs: 34,
    minFrameDeltaRatio: 0.75,
    hardSeekThresholdSeconds: 0.4,
    minStepSeconds: 0.03,
    maxStepSeconds: 0.18,
    stepRatio: 0.02,
  };

  const setProgress = (ratio) => {
    const clamped = clamp(ratio, 0, 1);

    if (progressBar) {
      progressBar.style.width = `${(clamped * 100).toFixed(2)}%`;
    }
  };

  const seekToRatio = (ratio, ts) => {
    if (!video) {
      return;
    }

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    const frameDuration = 1 / Math.max(scrubConfig.targetFps, 1);
    const desiredTime = clamp(ratio, 0, 1) * video.duration;
    const snappedTime = clamp(
      Math.round(desiredTime / frameDuration) * frameDuration,
      0,
      video.duration
    );

    const delta = snappedTime - video.currentTime;
    const maxStep = clamp(
      video.duration * scrubConfig.stepRatio,
      scrubConfig.minStepSeconds,
      scrubConfig.maxStepSeconds
    );
    const needsHardSeek = Math.abs(delta) > scrubConfig.hardSeekThresholdSeconds;
    const nextTime = needsHardSeek
      ? snappedTime
      : clamp(video.currentTime + clamp(delta, -maxStep, maxStep), 0, video.duration);
    const frameDelta = Math.abs(nextTime - lastIssuedTime);
    const minFrameDelta = frameDuration * scrubConfig.minFrameDeltaRatio;
    const timeSinceLastSeek = ts - lastSeekAt;

    if (
      !video.seeking &&
      (needsHardSeek ||
        (timeSinceLastSeek >= scrubConfig.minSeekIntervalMs && frameDelta >= minFrameDelta))
    ) {
      if (typeof video.fastSeek === "function") {
        video.fastSeek(nextTime);
      } else {
        video.currentTime = nextTime;
      }

      lastIssuedTime = nextTime;
      lastSeekAt = ts;
    }
  };

  const animateToTarget = (ts) => {
    rafId = 0;
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
    lastTs = ts;

    const delta = targetRatio - currentRatio;
    const smoothing = 1 - Math.exp(-scrubConfig.smoothingHz * dt);
    currentRatio += delta * smoothing;
    if (Math.abs(targetRatio - currentRatio) < scrubConfig.settleEpsilonRatio) {
      currentRatio = targetRatio;
    }

    setProgress(currentRatio);
    seekToRatio(currentRatio, ts);

    if (Math.abs(targetRatio - currentRatio) > scrubConfig.settleEpsilonRatio) {
      rafId = window.requestAnimationFrame(animateToTarget);
    }
  };

  const queueProgress = (ratio) => {
    targetRatio = clamp(ratio, 0, 1);
    if (!rafId) {
      rafId = window.requestAnimationFrame(animateToTarget);
    }
  };

  const updateFromPointer = (clientX) => {
    const rect = view.getBoundingClientRect();
    const ratio = (clientX - rect.left) / Math.max(rect.width, 1);
    queueProgress(ratio);
  };

  video.pause();
  video.addEventListener("loadedmetadata", () => {
    currentRatio = 0.5;
    targetRatio = 0.5;
    setProgress(0.5);
    seekToRatio(0.5, performance.now());
  });

  view.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      updateFromPointer(event.clientX);
    }
  });

  view.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" || pointerDown) {
      updateFromPointer(event.clientX);
    }
  });

  view.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    updateFromPointer(event.clientX);
  });

  view.addEventListener("pointerup", () => {
    pointerDown = false;
  });

  view.addEventListener("pointerleave", () => {
    pointerDown = false;
  });
});

const tvcStaticPreviews = document.querySelectorAll("[data-tvc-static-preview]");
if (tvcStaticPreviews.length > 0 && canHover) {
  const startStaticPreview = (block) => {
    const video = block.querySelector("[data-tvc-static-video]");
    if (!video) {
      return;
    }

    block.classList.add("is-hovered");

    if (prefersReducedMotion || isConstrainedConnection) {
      return;
    }

    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Ignore autoplay restrictions; controls remain available.
      });
    }
  };

  const stopStaticPreview = (block) => {
    const video = block.querySelector("[data-tvc-static-video]");
    if (!video) {
      return;
    }

    block.classList.remove("is-hovered");
    video.pause();
    video.currentTime = 0;
  };

  tvcStaticPreviews.forEach((block) => {
    block.addEventListener("pointerenter", () => startStaticPreview(block));
    block.addEventListener("pointerleave", () => stopStaticPreview(block));
    block.addEventListener("focusin", () => startStaticPreview(block));
    block.addEventListener("focusout", () => stopStaticPreview(block));
  });
}
