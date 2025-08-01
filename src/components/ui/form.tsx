// components/ui/form.tsx
"use client"

import * as React from "react"
import { useFormContext, Controller } from "react-hook-form"
import {
  Form as FormPrimitive,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem,
} from "@/components/ui/form-primitives" // Esto depende de cómo shadcn generó tu UI

import { cn } from "@/lib/utils"

export function Form({ className, ...props }: React.ComponentProps<"form">) {
  return <form className={cn("space-y-6", className)} {...props} />
}

export const FormField = ({ name, render }: { name: string; render: Function }) => {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => render({ field })}
    />
  )
}

export {
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem,
}
