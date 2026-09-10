type PromiseResolvers<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw({ raw: strings }, ...values).trim()
}

export type TemplateValues = Record<string, string | number | boolean | null | undefined>

export function renderTemplate(
  template: string,
  values: TemplateValues = {},
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = values[key]

    return value == null ? "" : String(value)
  })
}

export function withResolvers<T>(): PromiseResolvers<T> {
  let resolve!: ConstructorParameters<typeof Promise<T>>[0] extends (
    resolve: infer R,
    reject: infer _J
  ) => unknown
    ? R
    : never

  let reject!: ConstructorParameters<typeof Promise<T>>[0] extends (
    resolve: infer _R,
    reject: infer J
  ) => unknown
    ? J
    : never

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { resolve, reject, promise }
}