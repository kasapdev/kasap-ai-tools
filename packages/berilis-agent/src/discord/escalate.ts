import type { Message } from "discord.js";

/** Mentions the (single) Sistem Yöneticisi role - never CEO/Yönetici, per
 * Berilis's Discord hierarchy - with a short reason. Falls back to a plain
 * @-mention text if the role can't be found (e.g. renamed) so nothing is
 * silently dropped. */
export async function escalateToAdmin(
  message: Message,
  adminRoleName: string,
  reason: string,
): Promise<void> {
  const role = message.guild?.roles.cache.find((r) => r.name === adminRoleName);
  const mention = role ? `<@&${role.id}>` : `@${adminRoleName}`;

  if (!message.channel.isSendable()) return;
  await message.channel.send(`${mention} bu konu incelemenizi gerektirebilir.\nÖzet: ${reason}`);
}
