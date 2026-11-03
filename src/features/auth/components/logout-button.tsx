import { useLogout } from '@/features/auth/hooks/use-logout';
import { LogOut, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LogoutButton({ redirectTo, className, showLabel = false }: { redirectTo?: string; className?: string; showLabel?: boolean }) {
  const mutation = useLogout(redirectTo);
  return (
    <Button
      variant="outline"
      className={className}
      aria-label="Đăng xuất"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <LogOut />
      )}{' '}
      <span className={showLabel ? undefined : 'hidden sm:inline'}>Đăng xuất</span>
    </Button>
  );
}
