import { fadeIn, fadeOut, Modal, renderTemplate, Route, Toast } from "lib";
import { Leaderboard } from "../../modal/leaderboard";
import landingTemplate from "./index.html?raw";

export class Landing extends Route {
  protected render(): void {
    this.root.innerHTML = renderTemplate(landingTemplate);
    Leaderboard.create({
      name: "leaderboard",
    });

    const button = this.root.querySelector("button") as HTMLButtonElement;
    button.addEventListener("click", () => {
      Modal.show("leaderboard");
    });
  }

  protected onEnter(): void {
    fadeIn(this.root);

    Toast.show({
      message: "A toast from here."
    })
  }

  protected onLeave(): void {
    fadeOut(this.root);
  }
}
