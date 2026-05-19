import { lazy, Suspense } from "react";
import { twMerge } from "tailwind-merge";
import * as lucideIcons from "lucide-react";

// We still need the type for autocomplete to work
export const { icons } = lucideIcons;

interface LucideProps extends React.ComponentPropsWithoutRef<"svg"> {
  icon: keyof typeof icons;
  title?: string;
}

function Lucide(props: LucideProps) {
  const { icon, className, ...computedProps } = props;

  // Grab just the one icon we need instead of all of them
  const Component = icons[icon];

  if (!Component) return null;

  return (
    <Component
      {...computedProps}
      className={twMerge(["stroke-1.5 w-5 h-5", className])}
    />
  );
}

export default Lucide;