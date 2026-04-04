import React from 'react';
import { Metadata } from 'next';
import { getAnnouncements } from './actions';
import AnnouncementsClient from './AnnouncementsClient';

export const metadata: Metadata = {
  title: 'Announcements | Grandline',
  description: 'Important updates and news from your enrolled courses.',
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
