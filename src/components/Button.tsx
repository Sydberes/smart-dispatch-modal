// Ported from curri-components/src/components/Button/Button.tsx.
// Sizing + border pinned to explicit values: the package's responsive tokens
// resolve too small in this copied token set, and the (length:) border syntax
// doesn't compile here. Colors and structure stay on curri-styles tokens.
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap',
    'rounded-xs font-medium cursor-pointer',
    'border-[0.5px] border-solid',
    'transition-colors duration-150',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-text-selected',
    'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed',
  ],
  {
    defaultVariants: {
      shape: 'default',
      size: 'base',
      variant: 'brand',
    },
    variants: {
      shape: {
        default: 'px-3',
        icon: 'px-1.5',
      },
      size: {
        base: 'h-7 text-[11px] [&_svg]:size-[10px]',
        large: 'h-8 text-[12px] [&_svg]:size-[12px]',
      },
      variant: {
        'brand': [
          'text-text-brand-button border-transparent',
          'bg-background-brand-primary',
          'hover:bg-background-brand-primary-hover',
          'active:bg-background-brand-primary-pressed',
          '[&_svg]:text-icon-brand-button',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        'primary': [
          'text-text-primary border-border-primary shadow-elevation-element',
          'bg-background-neutral-primary',
          'hover:bg-background-neutral-primary-hover',
          'active:bg-background-neutral-primary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:shadow-none data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        'secondary': [
          'text-text-primary border-border-primary',
          'bg-background-neutral-secondary',
          'hover:bg-background-neutral-secondary-hover',
          'active:bg-background-neutral-secondary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:border-border-disabled data-[disabled]:text-text-disabled data-[disabled]:[&_svg]:text-icon-disabled',
        ],
        'tertiary': [
          'text-text-primary border-transparent',
          'bg-background-neutral-secondary',
          'hover:bg-background-neutral-secondary-hover',
          'active:bg-background-neutral-secondary-pressed',
          '[&_svg]:text-icon-primary',
          'data-[disabled]:bg-background-disabled data-[disabled]:text-text-disabled data-[disabled]:bg-transparent data-[disabled]:[&_svg]:text-icon-disabled',
        ],
      },
    },
  }
)

type ButtonProps = Omit<React.ComponentProps<typeof ButtonPrimitive>, 'className'> & {
  className?: string
  label?: string
  shape?: 'default' | 'icon'
  size?: 'base' | 'large'
  variant?: 'brand' | 'primary' | 'secondary' | 'tertiary'
}

function Button({
  children,
  className,
  label,
  shape = 'default',
  size = 'base',
  variant = 'brand',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ shape, size, variant }), className)}
      {...props}
    >
      {children || label}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
