"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type SelectWithCustomProps = {
  name: string
  label: string
  placeholder: string
  options: string[]
  disabled?: boolean
}

function SelectWithCustom({ name, label, placeholder, options, disabled }: SelectWithCustomProps) {
  const [value, setValue] = useState<string>("")
  const [mode, setMode] = useState<"preset" | "custom">("preset")
  const [custom, setCustom] = useState<string>("")
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === "custom") {
      customInputRef.current?.focus()
    }
  }, [mode])

  const display = mode === "custom" ? custom : value

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="justify-between w-full bg-transparent"
              aria-label={`Select ${label}`}
              title={`Select ${label}`}
            >
              <span className={display ? "text-foreground" : "text-muted-foreground"}>{display || placeholder}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            {options.map((opt) => (
              <DropdownMenuItem
                key={opt}
                onClick={() => {
                  setMode("preset")
                  setValue(opt)
                }}
              >
                {opt}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => {
                setMode("custom")
                setValue("")
              }}
            >
              Custom…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mode === "custom" && (
        <Input
          ref={customInputRef}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={`Enter custom ${label.toLowerCase()}`}
          disabled={disabled}
          aria-label={`Custom ${label}`}
        />
      )}

      {/* Hidden input to submit final value */}
      <input type="hidden" name={name} value={(mode === "custom" ? custom : value) || ""} />
    </div>
  )
}

export function PostForm({
  onSubmit,
  isLoading,
  submitButton,
}: {
  onSubmit: (formData: FormData) => void
  isLoading: boolean
  submitButton: React.ReactNode
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        onSubmit(fd)
      }}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          name="topic"
          placeholder="e.g. Using AI to summarize customer interviews"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectWithCustom
          name="audience"
          label="Audience"
          placeholder="Select or add custom"
          options={["Founders in SaaS", "Product managers", "Software engineers", "Designers", "Marketers"]}
          disabled={isLoading}
        />
        <SelectWithCustom
          name="tone"
          label="Tone"
          placeholder="Select or add custom"
          options={["Practical, concise", "Conversational", "Contrarian", "Inspirational", "Data-driven"]}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="styleUrl">Mimic Style (Optional)</Label>
        <Input
          id="styleUrl"
          name="styleUrl"
          placeholder="Paste a LinkedIn post URL to copy its style"
          disabled={isLoading}
          type="url"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cta">Call to action</Label>
        <Textarea
          id="cta"
          name="cta"
          placeholder="e.g. Ask readers about their process or share their best tip"
          rows={2}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-end">{submitButton}</div>
    </form>
  )
}
