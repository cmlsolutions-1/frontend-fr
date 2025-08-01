"use client"

import {
  FormProvider,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export function Form({
  children,
  ...props
}: {
  children: React.ReactNode
} & UseFormReturn<any>) {
  return <FormProvider {...props}>{children}</FormProvider>
}

export function FormField({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{children}</label>
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <Slot>{children}</Slot>
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>
}

export function FormMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-red-500">{children}</p>
}
