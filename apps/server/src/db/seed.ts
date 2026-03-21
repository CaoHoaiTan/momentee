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

    const insertedUsers = await db
      .insertInto('users')
      .values(users)
      .onConflict((oc) => oc.column('email').doNothing())
      .returning(['id', 'email'])
      .execute();

    // Map emails to actual IDs (handles both fresh inserts and existing rows)
    const emailToId: Record<string, string> = {};
    for (const u of insertedUsers) {
      emailToId[u.email] = u.id;
    }

    // If some users already existed, fetch their IDs
    const emails = ['test1@momentee.dev', 'test2@momentee.dev', 'test3@momentee.dev', 'test4@momentee.dev', 'test5@momentee.dev'];
    for (const email of emails) {
      if (!emailToId[email]) {
        const existing = await db
          .selectFrom('users')
          .select('id')
          .where('email', '=', email)
          .executeTakeFirst();
        if (existing) emailToId[email] = existing.id;
      }
    }

    const resolvedIds = {
      minh: emailToId['test1@momentee.dev'],
      linh: emailToId['test2@momentee.dev'],
      hao: emailToId['test3@momentee.dev'],
      trang: emailToId['test4@momentee.dev'],
      duc: emailToId['test5@momentee.dev'],
    };

    console.log(`Users: ${insertedUsers.length} inserted, ${emails.length - insertedUsers.length} already existed`);

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
        partner1_id: resolvedIds.minh,
        partner2_id: resolvedIds.linh,
        invite_code: createId(),
        theme: 'coral',
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
        partner1_id: resolvedIds.hao,
        partner2_id: resolvedIds.trang,
        invite_code: createId(),
        theme: 'teal',
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
        partner1_id: resolvedIds.duc,
        partner2_id: null,
        invite_code: 'INVITE-DUC-2024',
        theme: 'purple',
        is_public: false,
        is_pinned: false,
        view_count: 0,
        plan: 'free' as const,
      },
    ];

    const insertedCouples = await db
      .insertInto('couples')
      .values(couples)
      .onConflict((oc) => oc.column('slug').doNothing())
      .returning(['id', 'slug'])
      .execute();

    // Resolve couple IDs (fresh or existing)
    const slugToId: Record<string, string> = {};
    for (const c of insertedCouples) {
      slugToId[c.slug] = c.id;
    }
    const slugs = ['minh-linh', 'hao-trang', 'duc-love'];
    for (const slug of slugs) {
      if (!slugToId[slug]) {
        const existing = await db
          .selectFrom('couples')
          .select('id')
          .where('slug', '=', slug)
          .executeTakeFirst();
        if (existing) slugToId[slug] = existing.id;
      }
    }

    const resolvedCoupleIds = {
      minhLinh: slugToId['minh-linh'],
      haoTrang: slugToId['hao-trang'],
      ducAlone: slugToId['duc-love'],
    };

    console.log(`Couples: ${insertedCouples.length} inserted, ${slugs.length - insertedCouples.length} already existed`);

    // ─── Milestones ────────────────────────────────────────────────────
    // Check if milestones already exist for this couple
    const existingMilestones = await db
      .selectFrom('milestones')
      .select('id')
      .where('couple_id', '=', resolvedCoupleIds.minhLinh)
      .executeTakeFirst();

    if (!existingMilestones) {
      const milestones = [
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          title: 'First Date',
          description: 'We met at a coffee shop in District 1',
          date: '2024-01-15',
          icon: 'coffee',
          sort_order: 1,
        },
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          title: 'First Kiss',
          description: 'Under the stars at Landmark 81',
          date: '2024-02-01',
          icon: 'heart',
          sort_order: 2,
        },
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          title: 'Anniversary',
          description: 'One year of love and happiness',
          date: '2025-02-14',
          icon: 'cake',
          sort_order: 3,
        },
      ];

      await db.insertInto('milestones').values(milestones).execute();
      console.log(`Inserted ${milestones.length} milestones`);
    } else {
      console.log('Milestones: already exist, skipping');
    }

    // ─── Posts ──────────────────────────────────────────────────────────
    const existingPosts = await db
      .selectFrom('posts')
      .select('id')
      .where('couple_id', '=', resolvedCoupleIds.minhLinh)
      .executeTakeFirst();

    if (!existingPosts) {
      const posts = [
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          caption: 'Our first photo together! So happy to share this moment.',
          type: 'photo' as const,
          visibility: 'public' as const,
          is_pinned: true,
        },
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          caption: 'Love letter to my person. You make every day brighter.',
          type: 'letter' as const,
          visibility: 'public' as const,
          is_pinned: false,
        },
      ];

      await db.insertInto('posts').values(posts).execute();
      console.log(`Inserted ${posts.length} posts`);
    } else {
      console.log('Posts: already exist, skipping');
    }

    // ─── Wishes ────────────────────────────────────────────────────────
    const existingWishes = await db
      .selectFrom('wishes')
      .select('id')
      .where('couple_id', '=', resolvedCoupleIds.minhLinh)
      .executeTakeFirst();

    if (!existingWishes) {
      const wishes = [
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          author_name: 'Hao',
          message: 'You two are the cutest couple! Wishing you all the happiness in the world!',
          emoji: '💕',
          is_anonymous: false,
          is_approved: true,
        },
        {
          id: createId(),
          couple_id: resolvedCoupleIds.minhLinh,
          author_name: 'Anonymous',
          message: 'Stay strong and keep loving each other!',
          emoji: '🥰',
          is_anonymous: true,
          is_approved: true,
        },
      ];

      await db.insertInto('wishes').values(wishes).execute();
      console.log(`Inserted ${wishes.length} wishes`);
    } else {
      console.log('Wishes: already exist, skipping');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seed();
