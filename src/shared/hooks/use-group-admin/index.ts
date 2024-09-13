import { NDKKind } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useState } from 'react';

import { useNip29Ndk } from '@/shared/hooks';
import { GroupAdmin, GroupAdminPermission } from '@/shared/types';

export const useGroupAdmin = (groupId: string | undefined, adminPublickey: string | undefined) => {
  const { nip29Ndk } = useNip29Ndk();

  const [admin, setAdmin] = useState<GroupAdmin | undefined>(undefined);

  useEffect(() => {
    if (!groupId || !nip29Ndk || !adminPublickey) return;

    nip29Ndk
      .fetchEvent({ kinds: [39001 as NDKKind], '#d': [groupId], '#p': [adminPublickey] })
      .then((event) => {
        if (!event) return;

        const pTags = event.getMatchingTags('p');

        if (!pTags.length) return;

        const pTag = pTags[0];

        setAdmin({
          publicKey: pTag[1],
          permissions: pTag.slice(3) as GroupAdminPermission[],
        });
      });
  }, [groupId, adminPublickey, nip29Ndk]);

  return {
    admin,
    canAddUser: useMemo(() => admin?.permissions.includes('add-user') || false, [admin]),
    canRemoveUser: useMemo(() => admin?.permissions.includes('remove-user') || false, [admin]),
    canAddPermission: useMemo(
      () => admin?.permissions.includes('add-permission') || false,
      [admin],
    ),
    canRemovePermission: useMemo(
      () => admin?.permissions.includes('remove-permission') || false,
      [admin],
    ),
    canEditGroupStatus: useMemo(
      () => admin?.permissions.includes('edit-group-status') || false,
      [admin],
    ),
    canEditMetadata: useMemo(() => admin?.permissions.includes('edit-metadata') || false, [admin]),
    canDeleteEvent: useMemo(() => admin?.permissions.includes('delete-event') || false, [admin]),
  };
};
