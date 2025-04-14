// electron.d.ts
interface ElectronAPI {
  getNgrokUrl: () => Promise<string>;
  updateNgrokUrl: (url: string) => Promise<boolean>;
  reloadApp: () => void;
  isElectron: boolean;
}

interface Window {
  electron?: ElectronAPI;
}
