import "./index.css";

/** Configuration required to create a route. */
export type RouteProps = {
  name: string;
};

const routeCache = new Map<string, Route>();

export abstract class Route {
  private _props: RouteProps;
  private _initialized = false;
  private _operationId = 0;
  protected get root() {
    return this._root;
  }
  private _root: HTMLElement;

  /**
   * Base constructor for route factories.
   * Concrete routes can use the inherited static `create()` method instead of
   * exposing their own factory logic.
   */
  protected constructor(props: RouteProps) {
    this._props = props;
    if (routeCache.has(this._props.name)) {
      throw new Error(`The route named ${this._props.name} has existed.`);
    }

    this._root = document.createElement("div");
    this._root.classList.add(`page-${this._props.name}`, "page");
    hideElement(this._root);
    document.body.appendChild(this._root);
  }

  protected abstract render(): void;

  /** Optional hook called when this route becomes active. */
  protected abstract onEnter(operationId?: number): void

  /** Optional hook called when this route becomes inactive. */
  protected abstract onLeave(operationId?: number): void

  /** Creates, initializes, and registers a route instance. */
  static create<T extends Route>(this: any, props: RouteProps): T {
    const route = new this(props);
    route.initialize();
    return route;
  }

  /** Renders and registers this route once. Called by a concrete route factory. */
  protected initialize(): void {
    if (this._initialized) {
      throw new Error(`The route named ${this._props.name} has already been initialized.`);
    }

    try {
      this.render();
      if (routeCache.has(this._props.name)) {
        throw new Error(`The route named ${this._props.name} has existed.`);
      }
      routeCache.set(this._props.name, this);
      this._initialized = true;
    } catch (error) {
      this._root.remove();
      throw error;
    }
  }

  /** Starts a new operation and invalidates callbacks from earlier operations. */
  protected beginOperation(): number {
    this._operationId += 1;
    return this._operationId;
  }

  /** Returns whether an asynchronous operation is still current. */
  protected isCurrentOperation(operationId: number): boolean {
    return operationId === this._operationId;
  }

  /** Shows the route and runs the enter hook. */
  show(): void {
    const operationId = this.beginOperation();
    this.onEnter(operationId);
  }

  /** Hides the route and runs the leave hook. */
  hide(): void {
    const operationId = this.beginOperation();
    this.onLeave(operationId);
  }
}

export class Router {
  private static _previousRoute: Route | null = null;
  private static _navigationId = 0;

  /**
   * Navigates to a registered route.
   * Repeated navigation to the active route is ignored.
   */
  static navigate(name: string): void {
    if (!routeCache.has(name)) {
      throw new Error(`Can't navigate to unknown route: ${name}.`);
    }

    const route = routeCache.get(name)!;
    if (this._previousRoute === route) {
      return;
    }

    this._navigationId += 1;
    this._previousRoute?.hide();
    route.show();
    this._previousRoute = route;
  }

  /** Returns the id of the most recent route navigation. */
  static getNavigationId(): number {
    return this._navigationId;
  }
}

export function hideElement(root: HTMLElement) {
  root.classList.add("hide");
}

export function showElement(root: HTMLElement) {
  root.classList.remove("hide");
}
