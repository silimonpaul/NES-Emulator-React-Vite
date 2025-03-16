export class EmulatorUtils {
  public static formatHex(number: number, digits: number = 2): string {
    return number.toString(16).toUpperCase().padStart(digits, '0');
  }

  public static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return function executedFunction(...args: Parameters<T>): void {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  public static async loadROMFromFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  public static createDownloadLink(data: Uint8Array | string, filename: string): HTMLAnchorElement {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    return link;
  }

  public static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public static measurePerformance<T>(callback: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;
    return { result, duration };
  }

  public static async measureAsyncPerformance<T>(
    callback: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await callback();
    const duration = performance.now() - start;
    return { result, duration };
  }

  public static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  public static validateROMSize(size: number): boolean {
    // NES ROM size should be between 8KB and 4MB
    const MIN_SIZE = 8 * 1024;
    const MAX_SIZE = 4 * 1024 * 1024;
    return size >= MIN_SIZE && size <= MAX_SIZE;
  }

  public static generateChecksum(data: Uint8Array): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16).padStart(8, '0');
  }
} 