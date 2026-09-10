type InteractionState = {
  inert: boolean
}

/** Disables interaction and returns a function that restores the previous state. */
export function disableInteraction(root: HTMLElement): () => void {
  const previousState: InteractionState = {
    inert: root.inert,
  }

  root.inert = true

  return () => {
    root.inert = previousState.inert
  }
}