import {
  hideElement,
  renderTemplate,
  Route,
  Router,
  showElement,
} from "lib";
import loadingTemplate from "./index.html?raw";

export class Loading extends Route {
  private _navigationTimer?: ReturnType<typeof setTimeout>;

  protected render(): void {
    this.root.innerHTML = renderTemplate(loadingTemplate);
  }

  protected onEnter(operationId?: number): void {
    showElement(this.root);
    if (this._navigationTimer !== undefined) {
      clearTimeout(this._navigationTimer);
    }
    this._navigationTimer = setTimeout(() => {
      this._navigationTimer = undefined;
      if (operationId === undefined || !this.isCurrentOperation(operationId)) {
        return;
      }
      Router.navigate("landing");
    }, 3000);
  }

  protected onLeave(): void {
    if (this._navigationTimer !== undefined) {
      clearTimeout(this._navigationTimer);
      this._navigationTimer = undefined;
    }
    hideElement(this.root);
  }
}
