/**
 * Reference counter for fields
 */
export class Rc {
  private rc: number = 1

  constructor(private drop?: () => void) {}

  inc() {
    this.rc += 1
  }

  dec() {
    if (this.rc > 0) {
      this.rc -= 1

      if (this.rc === 0 && this.drop) {
        this.drop()
      }
    }
  }
}
