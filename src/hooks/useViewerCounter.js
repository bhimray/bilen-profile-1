import { useEffect, useState } from 'react';

const VISITOR_ID_KEY = 'portfolio_visitor_id';
const COUNTS_KEY = 'portfolio_view_counts';
const VISITOR_TRACKING_KEY = 'portfolio_viewer_tracking';

function getCurrentPeriodParts() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');

  return {
    yearKey: `${year}`,
    monthKey: `${year}-${month}`,
  };
}

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) {
    return existing;
  }

  const cryptoApi =
    typeof window !== 'undefined' && window.crypto ? window.crypto : null;
  const created =
    cryptoApi?.randomUUID?.() ||
    `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  localStorage.setItem(VISITOR_ID_KEY, created);
  return created;
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeCounts(data, { yearKey, monthKey }) {
  return {
    total: data?.total ?? 0,
    yearly: data?.years?.[yearKey] ?? 0,
    monthly: data?.months?.[monthKey] ?? 0,
  };
}

export function useViewerCounter() {
  const [state, setState] = useState({
    total: 0,
    monthly: 0,
    yearly: 0,
    loading: true,
    enabled: true,
    error: '',
  });

  useEffect(() => {
    try {
      const { yearKey, monthKey } = getCurrentPeriodParts();
      const visitorId = getVisitorId();
      const counts = readJson(COUNTS_KEY, { total: 0, years: {}, months: {} });
      const tracking = readJson(VISITOR_TRACKING_KEY, {});
      const visitor = tracking[visitorId] ?? {
        totalCounted: false,
        countedYears: {},
        countedMonths: {},
      };

      const shouldCountTotal = !visitor.totalCounted;
      const shouldCountYear = !visitor.countedYears?.[yearKey];
      const shouldCountMonth = !visitor.countedMonths?.[monthKey];

      const nextCounts = {
        total: shouldCountTotal ? counts.total + 1 : counts.total,
        years: {
          ...counts.years,
          [yearKey]: shouldCountYear ? (counts.years?.[yearKey] ?? 0) + 1 : counts.years?.[yearKey] ?? 0,
        },
        months: {
          ...counts.months,
          [monthKey]: shouldCountMonth ? (counts.months?.[monthKey] ?? 0) + 1 : counts.months?.[monthKey] ?? 0,
        },
      };

      const nextTracking = {
        ...tracking,
        [visitorId]: {
          totalCounted: visitor.totalCounted || shouldCountTotal,
          countedYears: {
            ...(visitor.countedYears ?? {}),
            [yearKey]: true,
          },
          countedMonths: {
            ...(visitor.countedMonths ?? {}),
            [monthKey]: true,
          },
        },
      };

      localStorage.setItem(COUNTS_KEY, JSON.stringify(nextCounts));
      localStorage.setItem(VISITOR_TRACKING_KEY, JSON.stringify(nextTracking));

      setState({
        ...normalizeCounts(nextCounts, { yearKey, monthKey }),
        loading: false,
        enabled: true,
        error: '',
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        enabled: false,
        error: 'Viewer counter is unavailable in this browser.',
      }));
    }
  }, []);

  return state;
}
