"use client";

import React from 'react';
import { CurrentHeaderSummary, CurrentSummaryEntry } from '@/features/timeEntries/components/CurrentHeaderSummary';
import { PositiveStreak, HourQualityBucket } from '@/lib/analytics/dayInsights';

type Props = {
  entry: CurrentSummaryEntry;
  nowIso?: string;
  streaks?: PositiveStreak[];
  hourly?: HourQualityBucket[];
};

export const HeaderCurrentEntry: React.FC<Props> = ({ entry, nowIso, streaks, hourly }) => {
  return <CurrentHeaderSummary entry={entry} nowIso={nowIso} streaks={streaks} hourly={hourly} />;
};
