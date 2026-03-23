import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { uploadImage } from '../utils/cloudinary.js';

async function resolveQrCode(qrCode: string | undefined | null): Promise<string | null> {
  if (!qrCode) return null;
  if (qrCode.startsWith('data:')) {
    const result = await uploadImage(qrCode, 'gift-qr');
    return result.url;
  }
  return qrCode;
}

interface CreateGiftAccountInput {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrCode?: string;
  note?: string;
}

interface UpdateGiftAccountInput {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrCode?: string;
  note?: string;
  isActive?: boolean;
}

export async function create(coupleId: string, userId: string, input: CreateGiftAccountInput) {
  await verifyCoupleOwnership(coupleId, userId);

  const qrUrl = await resolveQrCode(input.qrCode);

  const account = await db
    .insertInto('gift_accounts')
    .values({
      id: createId(),
      couple_id: coupleId,
      bank_name: input.bankName ?? null,
      account_number: input.accountNumber ?? null,
      account_holder: input.accountHolder ?? null,
      qr_code: qrUrl,
      note: input.note ?? null,
      is_active: true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return account;
}

export async function getById(id: string) {
  const account = await db
    .selectFrom('gift_accounts')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!account) throw NotFoundError('Gift Account');
  return account;
}

export async function listByCoupleId(coupleId: string) {
  return db
    .selectFrom('gift_accounts')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('created_at', 'desc')
    .execute();
}

export async function update(id: string, userId: string, input: UpdateGiftAccountInput) {
  const account = await getById(id);
  await verifyCoupleOwnership(account.couple_id, userId);

  const updateData: Record<string, unknown> = {};
  if (input.bankName !== undefined) updateData.bank_name = input.bankName;
  if (input.accountNumber !== undefined) updateData.account_number = input.accountNumber;
  if (input.accountHolder !== undefined) updateData.account_holder = input.accountHolder;
  if (input.qrCode !== undefined) updateData.qr_code = await resolveQrCode(input.qrCode);
  if (input.note !== undefined) updateData.note = input.note;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  if (Object.keys(updateData).length === 0) return account;

  return db
    .updateTable('gift_accounts')
    .set(updateData)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: string, userId: string) {
  const account = await getById(id);
  await verifyCoupleOwnership(account.couple_id, userId);
  await db.deleteFrom('gift_accounts').where('id', '=', id).execute();
  return true;
}

async function verifyCoupleOwnership(coupleId: string, userId: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) throw NotFoundError('Couple');
  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}
