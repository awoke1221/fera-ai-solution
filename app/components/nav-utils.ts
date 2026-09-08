export function isActivePath(currentPath: string, targetPath: string) {
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function shouldHideNav({
  scrollY,
  lastScrollY,
  menuOpen,
}: {
  scrollY: number;
  lastScrollY: number;
  menuOpen: boolean;
}) {
  if (menuOpen) return false;
  if (scrollY <= 80) return false;
  return scrollY > lastScrollY;
}
