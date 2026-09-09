import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

export function usePermission() {
  const { data: user } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  const isSuperAdmin = Boolean(user && (user as any).isSuperAdmin);
  const permissions: string[] = Array.isArray((user as any)?.permissions) ? (user as any).permissions : [];

  const hasPermission = (permissionKey: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionKeys.some((key) => permissions.includes(key));
  };

  return {
    user,
    isSuperAdmin,
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}
