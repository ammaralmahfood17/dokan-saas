'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  /** Controls visibility — use Radix's open/onOpenChange pattern */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading */
  title: string;
  /** Optional explanatory body text */
  description?: string;
  /** Label for the destructive confirm button (default: "تأكيد") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "إلغاء") */
  cancelLabel?: string;
  /** Whether the confirm action is in progress — disables both buttons */
  loading?: boolean;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void;
}

/**
 * ConfirmDialog — accessible, Radix-backed replacement for native confirm().
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   ...
 *   <button onClick={() => setOpen(true)}>حذف</button>
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="حذف العنصر؟"
 *     description="لا يمكن التراجع عن هذا الإجراء."
 *     onConfirm={handleDelete}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
