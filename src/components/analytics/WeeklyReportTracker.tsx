'use client';

import { useEffect, useRef } from 'react';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';

interface Props {
  weekSlug: string;
  year: number;
  weekNumber: number;
}

export function WeeklyReportTracker({ weekSlug, year, weekNumber }: Props) {
  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef<boolean>(false);

  useEffect(() => {
    // Record weekly_report_open event
    recordAnalyticsEvent('weekly_report_open', {
      weekSlug,
      metadata: {
        year,
        weekNumber,
      },
    });

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = (window.scrollY / scrollHeight) * 100;

      if (progress >= 90 && !completedRef.current) {
        completedRef.current = true;
        const dwellTimeSec = Math.round((Date.now() - startTimeRef.current) / 1000);
        recordAnalyticsEvent('weekly_report_complete', {
          weekSlug,
          metadata: {
            year,
            weekNumber,
            readTimeSeconds: dwellTimeSec,
          },
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [weekSlug, year, weekNumber]);

  return null;
}
