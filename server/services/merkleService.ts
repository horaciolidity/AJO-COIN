import crypto from 'crypto';

export interface UserAllocation {
  userId: string;
  walletAddress?: string;
  seasonId: string;
  ajoPoints: number;
  allocatedTokens: number;
}

export interface MerkleTreeResult {
  merkleRoot: string;
  totalAllocated: number;
  proofs: Record<string, { proof: string[]; amount: number }>;
}

/**
 * Hash a user allocation leaf node for Merkle Tree
 */
function hashLeaf(userId: string, amount: number): Buffer {
  const data = Buffer.concat([
    Buffer.from(userId),
    Buffer.from(amount.toString()),
  ]);
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * Hash two child nodes to compute parent hash
 */
function hashPair(left: Buffer, right: Buffer): Buffer {
  return crypto.createHash('sha256').update(Buffer.concat([left, right])).digest();
}

/**
 * Build Merkle Tree for Season Snapshot Allocations
 * Generates valid cryptographic Merkle Root and proofs for ERC-20 Claim Contract
 */
export function buildSeasonMerkleTree(allocations: UserAllocation[]): MerkleTreeResult {
  if (!allocations || allocations.length === 0) {
    return {
      merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
      totalAllocated: 0,
      proofs: {},
    };
  }

  const leaves = allocations.map((a) => ({
    userId: a.userId,
    amount: a.allocatedTokens,
    hash: hashLeaf(a.userId, a.allocatedTokens),
  }));

  let totalAllocated = 0;
  allocations.forEach((a) => (totalAllocated += a.allocatedTokens));

  // Build tree levels
  let currentLevel = leaves.map((l) => l.hash);
  const levels: Buffer[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: Buffer[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(hashPair(currentLevel[i], currentLevel[i + 1]));
      } else {
        // Odd leaf duplicate for balanced tree
        nextLevel.push(hashPair(currentLevel[i], currentLevel[i]));
      }
    }
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  const merkleRoot = '0x' + levels[levels.length - 1][0].toString('hex');

  // Generate proofs per user
  const proofs: Record<string, { proof: string[]; amount: number }> = {};

  leaves.forEach((leaf, idx) => {
    let index = idx;
    const userProof: string[] = [];

    for (let levelIdx = 0; levelIdx < levels.length - 1; levelIdx++) {
      const level = levels[levelIdx];
      const isRightNode = index % 2 === 1;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < level.length) {
        userProof.push('0x' + level[pairIndex].toString('hex'));
      } else {
        userProof.push('0x' + level[index].toString('hex'));
      }

      index = Math.floor(index / 2);
    }

    proofs[leaf.userId] = {
      proof: userProof,
      amount: leaf.amount,
    };
  });

  return {
    merkleRoot,
    totalAllocated,
    proofs,
  };
}
