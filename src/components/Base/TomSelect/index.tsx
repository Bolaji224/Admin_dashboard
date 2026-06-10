import "@/assets/css/vendors/tom-select.css";
import React, { createRef, useEffect, useMemo, useRef } from "react";
import clsx from "clsx";

import { setValue, init, updateValue } from "./tom-select";
import TomSelectPlugin from "tom-select";

/**
 * tom-select typings are inconsistent depending on version.
 * So we define safe fallback types here to avoid build errors.
 */
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

type TomSettings = Record<string, any>;
type TomInput = Record<string, any>;

export interface TomSelectElement
  extends HTMLSelectElement,
    Omit<TomInput, keyof HTMLSelectElement | "tomselect"> {
  TomSelect: TomSelectPlugin;
}

export interface TomSelectProps<T extends string | string[] = string>
  extends React.PropsWithChildren<{}>,
    Omit<React.ComponentPropsWithoutRef<"select">, "onChange" | "value"> {
  value: T;
  onOptionAdd?: (value: string) => void;
  onChange?: (e: { target: { value: T } }) => void;
  options?: RecursivePartial<TomSettings>;
  getRef?: (el: TomSelectElement) => void;
}

function TomSelect<T extends string | string[]>({
  className = "",
  options = {},
  value,
  onOptionAdd = () => {},
  onChange,
  getRef,
  children,
  ...computedProps
}: TomSelectProps<T>) {
  const initialRender = useRef(true);
  const tomSelectRef = createRef<TomSelectElement>();

  const memoProps = useMemo(() => {
    return {
      className,
      options,
      value,
      onOptionAdd,
      onChange,
      getRef,
    };
  }, [className, options, value, onOptionAdd, onChange, getRef]);

  const computedOptions = useMemo(() => {
    let mergedOptions: RecursivePartial<TomSettings> = {
      ...memoProps.options,
      plugins: {
        dropdown_input: {},
        ...(memoProps.options?.plugins || {}),
      },
    };

    if (Array.isArray(memoProps.value)) {
      mergedOptions = {
        persist: false,
        create: true,
        onDelete(values: string[]) {
          return confirm(
            values.length > 1
              ? `Are you sure you want to remove these ${values.length} items?`
              : `Are you sure you want to remove "${values[0]}"?`
          );
        },
        ...mergedOptions,
        plugins: {
          remove_button: {
            title: "Remove this item",
          },
          ...(mergedOptions.plugins || {}),
        },
      };
    }

    return mergedOptions;
  }, [memoProps.options, memoProps.value]);

  useEffect(() => {
    const current = tomSelectRef.current;
    if (!current) return;

    memoProps.getRef?.(current);

    if (initialRender.current) {
      current.setAttribute("data-id", "_" + Math.random().toString(36).substr(2, 9));

      const clonedEl = current.cloneNode(true) as TomSelectElement;

      const classNames = current.getAttribute("class");
      if (classNames) clonedEl.setAttribute("data-initial-class", classNames);

      current.parentNode?.appendChild(clonedEl);
      current.setAttribute("hidden", "true");

      setValue(clonedEl, memoProps);
      init(current, clonedEl, memoProps, computedOptions);

      initialRender.current = false;
    } else {
      const clonedEl = document.querySelector(
        `[data-id='${current.getAttribute("data-id")}'][data-initial-class]`
      ) as TomSelectElement | null;

      if (!clonedEl) return;

      updateValue(current, clonedEl, memoProps.value, memoProps, computedOptions);
    }
  }, [memoProps, computedOptions]);

  return (
    <select
      {...computedProps}
      ref={tomSelectRef}
      value={memoProps.value as any}
      onChange={(e) => {
        memoProps.onChange?.({
          target: {
            value: e.target.value as T,
          },
        });
      }}
      className={clsx(["tom-select", memoProps.className])}
    >
      {children}
    </select>
  );
}

export default TomSelect;
