/**
 * IP Address Classifier Utility
 * Classifies IPv4 and IPv6 addresses according to IANA standards
 * RFC 1918, RFC 6598, RFC 4193, RFC 4291
 */

export interface IPClassification {
  ip: string;
  version: 4 | 6;
  type: 'public' | 'private' | 'reserved' | 'loopback' | 'link-local' | 'multicast' | 'special';
  category: string;
  cidr: string;
  explanation: string;
  warning?: string;
}

/**
 * Parse IPv4 address into numeric octets
 */
function parseIPv4(ip: string): number[] | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  const octets = parts.map(p => {
    const num = parseInt(p, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    return num;
  });

  if (octets.some(o => o === null)) return null;
  return octets as number[];
}

/**
 * Check if IPv4 address is in CIDR range
 */
function isInCIDR(ip: string, cidr: string): boolean {
  const [network, maskBits] = cidr.split('/');
  const mask = parseInt(maskBits, 10);

  const ipOctets = parseIPv4(ip);
  const networkOctets = parseIPv4(network);

  if (!ipOctets || !networkOctets) return false;

  // Convert to 32-bit integer
  const ipInt = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
  const networkInt = (networkOctets[0] << 24) | (networkOctets[1] << 16) | (networkOctets[2] << 8) | networkOctets[3];
  const maskInt = mask === 0 ? 0 : ~((1 << (32 - mask)) - 1);

  return (ipInt & maskInt) === (networkInt & maskInt);
}

/**
 * Classify IPv4 address
 */
function classifyIPv4(ip: string): IPClassification {
  // RFC 1918 - Private Use
  if (isInCIDR(ip, '10.0.0.0/8')) {
    return {
      ip,
      version: 4,
      type: 'private',
      category: 'RFC 1918 Private Use',
      cidr: '10.0.0.0/8',
      explanation: 'Class A private network. Used for internal networks, not routable on the public internet.'
    };
  }

  if (isInCIDR(ip, '172.16.0.0/12')) {
    return {
      ip,
      version: 4,
      type: 'private',
      category: 'RFC 1918 Private Use',
      cidr: '172.16.0.0/12',
      explanation: 'Class B private network (172.16.0.0 - 172.31.255.255). Used for internal networks.'
    };
  }

  if (isInCIDR(ip, '192.168.0.0/16')) {
    return {
      ip,
      version: 4,
      type: 'private',
      category: 'RFC 1918 Private Use',
      cidr: '192.168.0.0/16',
      explanation: 'Class C private network. Commonly used in home and small business networks.'
    };
  }

  // RFC 6598 - Shared Address Space
  if (isInCIDR(ip, '100.64.0.0/10')) {
    return {
      ip,
      version: 4,
      type: 'special',
      category: 'RFC 6598 Carrier-Grade NAT',
      cidr: '100.64.0.0/10',
      explanation: 'Shared address space for carrier-grade NAT. Used by ISPs for internal routing.'
    };
  }

  // Loopback
  if (isInCIDR(ip, '127.0.0.0/8')) {
    return {
      ip,
      version: 4,
      type: 'loopback',
      category: 'Loopback',
      cidr: '127.0.0.0/8',
      explanation: 'Loopback address. Used to refer to the local machine (localhost).'
    };
  }

  // Link-Local
  if (isInCIDR(ip, '169.254.0.0/16')) {
    return {
      ip,
      version: 4,
      type: 'link-local',
      category: 'APIPA Link-Local',
      cidr: '169.254.0.0/16',
      explanation: 'Automatic Private IP Addressing (APIPA). Auto-assigned when DHCP fails.',
      warning: 'This indicates a network configuration problem if unexpected.'
    };
  }

  // Multicast
  if (isInCIDR(ip, '224.0.0.0/4')) {
    return {
      ip,
      version: 4,
      type: 'multicast',
      category: 'Multicast',
      cidr: '224.0.0.0/4',
      explanation: 'Multicast address range (224.0.0.0 - 239.255.255.255). Used for one-to-many communication.'
    };
  }

  // Reserved / Special Use
  if (isInCIDR(ip, '0.0.0.0/8')) {
    return {
      ip,
      version: 4,
      type: 'reserved',
      category: 'Reserved - Current Network',
      cidr: '0.0.0.0/8',
      explanation: 'Reserved for "this network". Only valid as source address.'
    };
  }

  if (isInCIDR(ip, '192.0.0.0/24')) {
    return {
      ip,
      version: 4,
      type: 'reserved',
      category: 'IETF Protocol Assignments',
      cidr: '192.0.0.0/24',
      explanation: 'Reserved for IETF protocol assignments and documentation.'
    };
  }

  if (isInCIDR(ip, '192.0.2.0/24') || isInCIDR(ip, '198.51.100.0/24') || isInCIDR(ip, '203.0.113.0/24')) {
    return {
      ip,
      version: 4,
      type: 'reserved',
      category: 'Documentation (TEST-NET)',
      cidr: ip.startsWith('192') ? '192.0.2.0/24' : ip.startsWith('198') ? '198.51.100.0/24' : '203.0.113.0/24',
      explanation: 'Reserved for documentation and examples. Should not be routed.'
    };
  }

  if (isInCIDR(ip, '240.0.0.0/4')) {
    return {
      ip,
      version: 4,
      type: 'reserved',
      category: 'Reserved for Future Use',
      cidr: '240.0.0.0/4',
      explanation: 'Reserved for future use. Not valid for general use.'
    };
  }

  if (ip === '255.255.255.255') {
    return {
      ip,
      version: 4,
      type: 'reserved',
      category: 'Limited Broadcast',
      cidr: '255.255.255.255/32',
      explanation: 'Limited broadcast address. Used for broadcast within local network.'
    };
  }

  // Default: Public IP
  return {
    ip,
    version: 4,
    type: 'public',
    category: 'Public Internet',
    cidr: 'N/A',
    explanation: 'Public routable IP address. Reachable from the internet.'
  };
}

/**
 * Normalize and validate IPv6 address
 */
function normalizeIPv6(ip: string): string | null {
  // Remove leading/trailing whitespace
  ip = ip.trim();

  // Handle :: expansion
  if (ip.includes('::')) {
    const parts = ip.split('::');
    if (parts.length > 2) return null; // Multiple :: not allowed

    const before = parts[0] ? parts[0].split(':') : [];
    const after = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - before.length - after.length;

    if (missing < 0) return null;

    const expanded = [
      ...before,
      ...Array(missing).fill('0'),
      ...after
    ];

    ip = expanded.join(':');
  }

  const groups = ip.split(':');
  if (groups.length !== 8) return null;

  // Validate each group
  for (const group of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
  }

  return groups.map(g => g.padStart(4, '0').toLowerCase()).join(':');
}

/**
 * Classify IPv6 address
 */
function classifyIPv6(ip: string): IPClassification {
  const normalized = normalizeIPv6(ip);
  if (!normalized) {
    throw new Error('Invalid IPv6 address format');
  }

  // Loopback
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0001') {
    return {
      ip,
      version: 6,
      type: 'loopback',
      category: 'Loopback',
      cidr: '::1/128',
      explanation: 'IPv6 loopback address. Equivalent to 127.0.0.1 in IPv4.'
    };
  }

  // Unspecified
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0000') {
    return {
      ip,
      version: 6,
      type: 'reserved',
      category: 'Unspecified',
      cidr: '::/128',
      explanation: 'Unspecified address. Used to indicate absence of an address.'
    };
  }

  // Link-Local
  if (normalized.startsWith('fe80:')) {
    return {
      ip,
      version: 6,
      type: 'link-local',
      category: 'Link-Local Unicast',
      cidr: 'fe80::/10',
      explanation: 'Link-local address. Valid only within a single network segment.'
    };
  }

  // Unique Local (Private)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return {
      ip,
      version: 6,
      type: 'private',
      category: 'RFC 4193 Unique Local',
      cidr: 'fc00::/7',
      explanation: 'IPv6 private address space. Similar to RFC 1918 in IPv4.'
    };
  }

  // Multicast
  if (normalized.startsWith('ff')) {
    return {
      ip,
      version: 6,
      type: 'multicast',
      category: 'Multicast',
      cidr: 'ff00::/8',
      explanation: 'IPv6 multicast address. Used for one-to-many communication.'
    };
  }

  // Documentation
  if (normalized.startsWith('2001:0db8:')) {
    return {
      ip,
      version: 6,
      type: 'reserved',
      category: 'Documentation',
      cidr: '2001:db8::/32',
      explanation: 'Reserved for documentation and examples. Should not be routed.'
    };
  }

  // 6to4
  if (normalized.startsWith('2002:')) {
    return {
      ip,
      version: 6,
      type: 'special',
      category: '6to4 Tunneling',
      cidr: '2002::/16',
      explanation: '6to4 transition mechanism. Encapsulates IPv6 over IPv4.'
    };
  }

  // Default: Global Unicast (Public)
  if (normalized.startsWith('2') || normalized.startsWith('3')) {
    return {
      ip,
      version: 6,
      type: 'public',
      category: 'Global Unicast',
      cidr: '2000::/3',
      explanation: 'Public routable IPv6 address. Reachable from the internet.'
    };
  }

  // Other reserved
  return {
    ip,
    version: 6,
    type: 'reserved',
    category: 'Reserved',
    cidr: 'N/A',
    explanation: 'Reserved IPv6 address block.'
  };
}

/**
 * Main classification function
 */
export function classifyIP(ip: string): IPClassification {
  if (!ip || typeof ip !== 'string') {
    throw new Error('Invalid input: IP address must be a non-empty string');
  }

  ip = ip.trim();

  // Detect IPv4 vs IPv6
  if (ip.includes(':')) {
    return classifyIPv6(ip);
  } else if (ip.includes('.')) {
    const octets = parseIPv4(ip);
    if (!octets) {
      throw new Error('Invalid IPv4 address format');
    }
    return classifyIPv4(ip);
  } else {
    throw new Error('Invalid IP address format');
  }
}
