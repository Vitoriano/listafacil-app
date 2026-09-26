import { useLocalSearchParams } from 'expo-router';
import { useListDetail } from '@/features/lists/hooks/useListDetail';
import type { LinkedListInput } from '../stores/cartStore';

/**
 * Lê `?listId=` (fluxo "iniciar compra a partir de uma lista") e carrega a lista
 * para vinculá-la assim que a loja for escolhida.
 */
export function useLinkedListParam(): {
  listId: string | null;
  linkedList: LinkedListInput | null;
  isLoading: boolean;
  /** Params prontos para propagar entre as telas de escolha de loja (href em objeto). */
  params: { listId?: string };
} {
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const id = listId && listId.length > 0 ? listId : null;
  const { data: list, isLoading } = useListDetail(id);

  return {
    listId: id,
    linkedList: list ? { id: list.id, name: list.name, items: list.items } : null,
    isLoading: !!id && isLoading,
    params: id ? { listId: id } : {},
  };
}
