import { SITES_TO_MONITOR } from "../consts/rot-hosts";

export function isUrlRotPage(url: string): boolean {
  if (!url) return false;

  return SITES_TO_MONITOR.some((site) => {
    return url.includes(site);
  });
}
