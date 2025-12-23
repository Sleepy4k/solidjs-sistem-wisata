class LocalStorage {
  static setItem(key: string, value: string): void {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static getItem(key: string): string | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static getOrCreateItem(key: string, defaultValue: string): string {
    let item = this.getItem(key);
    if (item === null) {
      this.setItem(key, defaultValue);
      item = defaultValue;
    }
    return item;
  }
}

export default LocalStorage;
