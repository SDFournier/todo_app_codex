"use client";

import React from 'react';
import { CurrentHeaderSummary, CurrentSummaryEntry } from '@/features/timeEntries/components/CurrentHeaderSummary';

type Props = {
  entry: CurrentSummaryEntry;
  nowIso?: string;
};

export const HeaderCurrentEntry: React.FC<Props> = ({ entry, nowIso }) => {
  return <CurrentHeaderSummary entry={entry} nowIso={nowIso} />;
};
