function normalize(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

export function isBlockedDomain(hostname: string, blockedList: string[]): boolean {
  const normalizedHost = normalize(hostname);
  return blockedList.some((blocked) => {
    const normalizedBlocked = normalize(blocked);
    return (
      normalizedHost === normalizedBlocked ||
      normalizedHost.endsWith('.' + normalizedBlocked)
    );
  });
}
