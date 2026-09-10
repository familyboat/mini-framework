import { fadeIn, fadeOut } from "../animate";
import "./index.css";

export type ToastPosition = "top" | "bottom";
export type ToastKind = "info" | "success" | "error";

export type ToastProps = {
  message: string;
  duration?: number;
  position?: ToastPosition;
  kind?: ToastKind;
};

export class Toast {
  private static readonly defaultDuration = 3000;
  private static containers = new Map<ToastPosition, HTMLElement>();

  private _props: Required<Pick<ToastProps, "duration" | "position" | "kind">> & Pick<ToastProps, "message">;
  private _root: HTMLElement;
  private _container: HTMLElement;
  private _timer?: ReturnType<typeof setTimeout>;
  private _destroyed = false;
  private _operationId = 0;

  private constructor(props: ToastProps) {
    this._props = {
      message: props.message,
      duration: props.duration ?? Toast.defaultDuration,
      position: props.position ?? "top",
      kind: props.kind ?? "info",
    };

    this._container = Toast.getContainer(this._props.position);
    this._root = document.createElement("div");
    this._root.classList.add("toast", `toast--${this._props.kind}`);
    this._root.setAttribute("role", "status");
    this._root.setAttribute("aria-live", "polite");

    const message = document.createElement("span");
    message.classList.add("toast__message");
    message.textContent = this._props.message;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.classList.add("toast__close");
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close toast");
    closeButton.addEventListener("click", () => {
      this.dismiss();
    });

    this._root.appendChild(message);
    this._root.appendChild(closeButton);
  }

  /** Creates and shows a toast instance. */
  static show(props: ToastProps): Toast {
    const toast = new Toast(props);
    toast.mount();
    toast.show();
    return toast;
  }

  /** Removes all visible toasts. */
  static clear(): void {
    for (const container of Toast.containers.values()) {
      container.replaceChildren();
    }
  }

  /** Dismisses this toast immediately. */
  dismiss(): void {
    if (this._destroyed) {
      return;
    }

    this.clearTimer();
    this.beginOperation();
    void fadeOut(this._root, { duration: "180ms" }).then((completed) => {
      if (!this.isCurrentOperation(this._operationId) || !completed) {
        return;
      }

      this.destroy();
    });
  }

  /** Removes this toast from the document. */
  destroy(): void {
    if (this._destroyed) {
      return;
    }

    this._destroyed = true;
    this.clearTimer();
    this._root.remove();
  }

  private mount(): void {
    this._container.appendChild(this._root);
  }

  private show(): void {
    const operationId = this.beginOperation();
    void fadeIn(this._root, { duration: "180ms" }).then((completed) => {
      if (!this.isCurrentOperation(operationId) || !completed) {
        return;
      }

      this._timer = setTimeout(() => {
        this.dismiss();
      }, this._props.duration);
    });
  }

  private clearTimer(): void {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  private beginOperation(): number {
    this._operationId += 1;
    return this._operationId;
  }

  private isCurrentOperation(operationId: number): boolean {
    return operationId === this._operationId;
  }

  private static getContainer(position: ToastPosition): HTMLElement {
    const existing = Toast.containers.get(position);
    if (existing) {
      return existing;
    }

    const container = document.createElement("div");
    container.classList.add("toast-container", `toast-container--${position}`);
    document.body.appendChild(container);

    Toast.containers.set(position, container);
    return container;
  }
}
