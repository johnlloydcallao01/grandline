import { PlayerItemType } from '@/types/player';

export function buildItemKey(type: PlayerItemType, id: string) {
  return `${type}:${id}`;
}
