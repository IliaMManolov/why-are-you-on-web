export function parseDomainInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let hostname: string;
  try {
    // If it looks like a URL (has protocol or slash), parse it
    const withProtocol = trimmed.includes('://') ? trimmed : 'https://' + trimmed;
    const url = new URL(withProtocol);
    hostname = url.hostname;
  } catch {
    return null;
  }

  // Strip www., lowercase
  hostname = hostname.toLowerCase().replace(/^www\./, '');

  // Basic validation: must have at least one dot and no spaces
  if (!hostname.includes('.') || hostname.includes(' ')) return null;

  return hostname;
}
