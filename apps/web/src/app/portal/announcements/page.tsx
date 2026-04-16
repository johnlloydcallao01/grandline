import React from 'react';
import { Metadata } from 'next';
import { getAnnouncements } from '../../(main)/announcements/actions';
import AnnouncementsClient from '../../(main)/announcements/AnnouncementsClient';

export const metadata: Metadata = {
  title: 'Portal Announcements | Grandline',
  description: 'Important updates and news from your enrolled courses.',
};

export default async function PortalAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
