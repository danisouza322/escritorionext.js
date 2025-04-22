import { useToast as useToastOriginal } from "@/components/ui/use-toast";
import { type ToastActionElement } from "@/components/ui/toast";

type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const { toast, dismiss, ...rest } = useToastOriginal();

  return {
    toast: ({ title, description, action, variant = "default" }: ToastProps) => {
      toast({
        title,
        description,
        action,
        variant,
      });
    },
    dismiss,
    ...rest,
  };
};