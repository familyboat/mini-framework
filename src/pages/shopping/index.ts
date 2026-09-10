import { leftSlideOut, renderTemplate, rightSlideIn, Route, Router } from "lib";
import shoppingTemplate from "./index.html?raw";

export class Shopping extends Route {
  private _navigationTimer?: ReturnType<typeof setTimeout>;

  protected render(): void {
    this.root.innerHTML = renderTemplate(shoppingTemplate);
  }

  protected onEnter(operationId?: number): void {
    rightSlideIn(this.root);

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
    leftSlideOut(this.root);
  }
}
