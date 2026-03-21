import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

async function seed() {
  try {
    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ─── Users ─────────────────────────────────────────────────────────
    const userIds = {
      minh: createId(),
      linh: createId(),
      hao: createId(),
      trang: createId(),
      duc: createId(),
    };

    const users = [
      {
        id: userIds.minh,
        email: 'test1@momentee.dev',
        name: 'Minh',
        password: hashedPassword,
        email_verified: true,
        role: 'user' as const,
        plan: 'free' as const,
      },
      {
        id: userIds.linh,
        email: 'test2@momentee.dev',
        name: 'Linh',
        password: hashedPassword,
        email_verified: true,
        role: 'user' as const,
        plan: 'free' as const,
      },
      {
        id: userIds.hao,
        email: 'test3@momentee.dev',
        name: 'Hao',
        password: hashedPassword,
        email_verified: true,
        role: 'user' as const,
        plan: 'free' as const,
      },
      {
        id: userIds.trang,
        email: 'test4@momentee.dev',
        name: 'Trang',
        password: hashedPassword,
        email_verified: true,
        role: 'user' as const,
        plan: 'free' as const,
      },
      {
        id: userIds.duc,
        email: 'test5@momentee.dev',
        name: 'Duc',
        password: hashedPassword,
        email_verified: true,
        role: 'user' as const,
        plan: 'free' as const,
      },
    ];

    await db.insertInto('users').values(users).execute();
    console.log(`Inserted ${users.length} users`);

    // ─── Couples ───────────────────────────────────────────────────────
    const coupleIds = {
      minhLinh: createId(),
      haoTrang: createId(),
      ducAlone: createId(),
    };

    const couples = [
      {
        id: coupleIds.minhLinh,
        slug: 'minh-linh',
        display_name: 'Minh & Linh',
        partner1_id: userIds.minh,
        partner2_id: userIds.linh,
        invite_code: createId(),
        theme: 'default',
        is_public: true,
        is_pinned: false,
        view_count: 0,
        plan: 'free' as const,
        anniversary: '2024-02-14',
      },
      {
        id: coupleIds.haoTrang,
        slug: 'hao-trang',
        display_name: 'Hao & Trang',
        partner1_id: userIds.hao,
        partner2_id: userIds.trang,
        invite_code: createId(),
        theme: 'default',
        is_public: true,
        is_pinned: false,
        view_count: 0,
        plan: 'free' as const,
        anniversary: '2023-12-25',
      },
      {
        id: coupleIds.ducAlone,
        slug: 'duc-love',
        display_name: 'Duc & ???',
        partner1_id: userIds.duc,
        partner2_id: null,
        invite_code: 'INVITE-DUC-2024',
        theme: 'default',
        is_public: false,
        is_pinned: false,
        view_count: 0,
        plan: 'free' as const,
      },
    ];

    await db.insertInto('couples').values(couples).execute();
    console.log(`Inserted ${couples.length} couples`);

    // ─── Milestones ────────────────────────────────────────────────────
    const milestones = [
      {
        id: createId(),
        couple_id: coupleIds.minhLinh,
        title: 'First Date',
        description: 'We met at a coffee shop in District 1',
        date: '2024-01-15',
        icon: 'coffee',
        sort_order: 1,
      },
      {
        id: createId(),
        couple_id: coupleIds.minhLinh,
        title: 'First Kiss',
        description: 'Under the stars at Landmark 81',
        date: '2024-02-01',
        icon: 'heart',
        sort_order: 2,
      },
      {
        id: createId(),
        couple_id: coupleIds.minhLinh,
        title: 'Anniversary',
        description: 'One year of love and happiness',
        date: '2025-02-14',
        icon: 'cake',
        sort_order: 3,
      },
    ];

    await db.insertInto('milestones').values(milestones).execute();
    console.log(`Inserted ${milestones.length} milestones`);

    // ─── Posts ──────────────────────────────────────────────────────────
    const postIds = {
      post1: createId(),
      post2: createId(),
    };

    const posts = [
      {
        id: postIds.post1,
        couple_id: coupleIds.minhLinh,
        caption: 'Our first photo together! So happy to share this moment.',
        type: 'photo' as const,
        visibility: 'public' as const,
        is_pinned: true,
      },
      {
        id: postIds.post2,
        couple_id: coupleIds.minhLinh,
        caption: 'Love letter to my person. You make every day brighter.',
        type: 'letter' as const,
        visibility: 'public' as const,
        is_pinned: false,
      },
    ];

    await db.insertInto('posts').values(posts).execute();
    console.log(`Inserted ${posts.length} posts`);

    // ─── Wishes ────────────────────────────────────────────────────────
    const wishes = [
      {
        id: createId(),
        couple_id: coupleIds.minhLinh,
        author_name: 'Hao',
        message: 'You two are the cutest couple! Wishing you all the happiness in the world!',
        emoji: '💕',
        is_anonymous: false,
        is_approved: true,
      },
      {
        id: createId(),
        couple_id: coupleIds.minhLinh,
        author_name: 'Anonymous',
        message: 'Stay strong and keep loving each other!',
        emoji: '🥰',
        is_anonymous: true,
        is_approved: true,
      },
    ];

    await db.insertInto('wishes').values(wishes).execute();
    console.log(`Inserted ${wishes.length} wishes`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seed();
