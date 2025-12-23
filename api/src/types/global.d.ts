export {}

declare global {
  // Cedar tests sometimes provide helpers on the global object.
  // Declaring them here keeps TypeScript happy without `as any`.
  // eslint-disable-next-line no-var
  var mockCurrentUser:
    | undefined
    | ((user: Record<string, unknown> | null) => void)

  // eslint-disable-next-line no-var
  var context: undefined | Record<string, unknown>
}
