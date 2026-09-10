import { fadeIn, fadeOut, Modal, renderTemplate } from "lib";
import leaderboardTemplate from "./index.html?raw";
import "./index.css";

export class Leaderboard extends Modal {
  private _mask!: HTMLDivElement;
  private _handleMaskClick = () => {
    Modal.hide('leaderboard')
  };

  protected render(): void {
    this.root.innerHTML = renderTemplate(leaderboardTemplate);

    this._mask = this.root.querySelector(".modal__mask")!;

    this._mask.addEventListener('click', this._handleMaskClick)
  }

  protected dispose(): void {
    this._mask.removeEventListener('click', this._handleMaskClick)
  }

  protected onShow(_operationId: number): void {
    fadeIn(this.root);
  }

  protected onHide(_operationId: number): void {
    fadeOut(this.root);
  }
}
