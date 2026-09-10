import { hideElement } from "../router";
import "./index.css";

export type ModalProps = {
  name: string;
};

const modalCache = new Map<string, Modal>();

export abstract class Modal {
  private _props: ModalProps;
  private _initialized = false;
  private _destroyed = false;
  private _operationId = 0;

  protected get root() {
    return this._root;
  }
  private _root: HTMLElement;

  protected constructor(props: ModalProps) {
    this._props = props;
    if (modalCache.has(this._props.name)) {
      throw new Error(`The modal named ${this._props.name} has existed.`);
    }

    this._root = document.createElement("div");
    this._root.classList.add(`modal-${this._props.name}`, "modal");
    hideElement(this._root);
    document.body.appendChild(this._root);
  }

  protected abstract render(): void;

  /** Creates, initializes, and registers a modal instance. */
  static create<T extends Modal>(this: any, props: ModalProps): T {
    const modal = new this(props);
    modal.initialize();
    return modal;
  }

  /** Shows this modal and starts a new modal operation. */
  show(): void {
    this.assertUsable();
    const operationId = this.beginOperation();
    this.onShow(operationId);
  }

  /** Hides this modal and starts a new modal operation. */
  hide(): void {
    this.assertUsable();
    const operationId = this.beginOperation();
    this.onHide(operationId);
  }

  protected abstract onShow(operationId: number): void;
  protected abstract onHide(operationId: number): void;

  /** Renders and registers this modal once. */
  protected initialize(): void {
    if (this._destroyed) {
      throw new Error(`The modal named ${this._props.name} has been destroyed.`);
    }

    if (this._initialized) {
      throw new Error(`The modal named ${this._props.name} has already been initialized.`);
    }

    try {
      this.render();
      if (modalCache.has(this._props.name)) {
        throw new Error(`The modal named ${this._props.name} has existed.`);
      }
      modalCache.set(this._props.name, this);
      this._initialized = true;
    } catch (error) {
      this._initialized = false;
      if (modalCache.get(this._props.name) === this) {
        modalCache.delete(this._props.name);
      }
      this._root.remove();
      throw error;
    }
  }

  /** Hook for subclasses to release resources they created. */
  protected dispose(): void {}

  /** Starts a new operation and invalidates callbacks from earlier operations. */
  protected beginOperation(): number {
    this._operationId += 1;
    return this._operationId;
  }

  /** Returns whether an asynchronous operation is still current. */
  protected isCurrentOperation(operationId: number): boolean {
    return operationId === this._operationId;
  }

  /** Throws when a modal is used after it has been destroyed. */
  private assertUsable(): void {
    if (this._destroyed) {
      throw new Error(`The modal named ${this._props.name} has been destroyed.`);
    }
  }

  /** Shows a registered modal by name. */
  static show(modalName: string): void {
    const modal = modalCache.get(modalName);
    if (!modal) {
      throw new Error(`Can't show unknown modal: ${modalName}.`);
    }

    modal.show();
  }

  /** Hides a registered modal by name. */
  static hide(modalName: string): void {
    const modal = modalCache.get(modalName);
    if (!modal) {
      throw new Error(`Can't hide unknown modal: ${modalName}.`);
    }

    modal.hide();
  }

  /** Destroys a registered modal by name. */
  static destroy(modalName: string): void {
    const modal = modalCache.get(modalName);
    if (!modal) {
      throw new Error(`Can't destroy unknown modal: ${modalName}.`);
    }

    modal.destroy();
  }

  /** Removes this modal from the registry and document. */
  destroy(): void {
    if (this._destroyed) {
      return;
    }

    this._destroyed = true;
    this.beginOperation();
    this.dispose();

    if (modalCache.get(this._props.name) === this) {
      modalCache.delete(this._props.name);
    }

    this._root.remove();
  }
}
