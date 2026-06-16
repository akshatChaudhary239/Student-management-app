import { Expo } from 'expo-server-sdk';
import prisma from '../../config/db';

const expo = new Expo();

export const saveOwnerPushToken = async (ownerId: string, pushToken: string) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error('Invalid Expo push token');
  }

  await prisma.owner.update({
    where: { id: ownerId },
    data: { pushToken },
  });

  return { message: 'Push token saved successfully' };
};

export const createNotification = async (organizationId: string, title: string, message: string, type: string) => {
  // Save notification in database
  const notification = await prisma.notification.create({
    data: {
      organizationId,
      title,
      message,
      type,
    },
  });

  // Get the owner's push token
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { owner: true },
  });

  const pushToken = organization?.owner?.pushToken;

  // Send push notification if token exists
  if (pushToken && Expo.isExpoPushToken(pushToken)) {
    const messages = [{
      to: pushToken,
      sound: 'default' as const,
      title,
      body: message,
      data: { notificationId: notification.id, type },
    }];

    try {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      // We don't throw error here to not fail the main flow if push fails
    }
  }

  return notification;
};

export const getNotifications = async (organizationId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { organizationId } }),
    prisma.notification.count({ where: { organizationId, isRead: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const markAsRead = async (organizationId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, organizationId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (organizationId: string) => {
  return await prisma.notification.updateMany({
    where: { organizationId, isRead: false },
    data: { isRead: true },
  });
};
