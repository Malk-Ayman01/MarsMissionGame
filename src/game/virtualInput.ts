export const virtualInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  privateActionQueued: false,
  privateSpaceQueued: false,

  triggerAction() {
    this.privateActionQueued = true;
  },

  triggerSpace() {
    this.privateSpaceQueued = true;
  },

  consumeAction(): boolean {
    if (this.privateActionQueued) {
      this.privateActionQueued = false;
      return true;
    }
    return false;
  },

  consumeSpace(): boolean {
    if (this.privateSpaceQueued) {
      this.privateSpaceQueued = false;
      return true;
    }
    return false;
  },

  resetAll() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.privateActionQueued = false;
    this.privateSpaceQueued = false;
  },
};
