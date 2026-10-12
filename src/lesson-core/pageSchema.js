const defaultAdvance = "question";
const defaultLayoutFamily = "standard";

export function normalizePages(pages) {
  return pages.map(normalizePage);
}

export function normalizePage(page) {
  return {
    advance: defaultAdvance,
    body: [],
    layoutFamily: defaultLayoutFamily,
    toolOptions: {},
    ...page
  };
}

export function getPageLayout(page, layoutFamilies = {}) {
  const family = page?.layoutFamily ?? defaultLayoutFamily;
  return {
    family,
    isCompactVisual: Boolean(layoutFamilies[family]?.compactVisual),
    isToolGated: page?.advance === "toolComplete"
  };
}
