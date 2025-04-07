import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

// ABI for the points contract (simplified for the functions we need)
const POINTS_CONTRACT_ABI = [
  // Read functions
  "function getUserPoints(address user) view returns (uint256)",
  "function getPostPoints(uint256 postId) view returns (uint256)",
  "function getTotalPoints() view returns (uint256)",
  // Write functions
  "function awardPointsForPost(address user, uint256 postId, uint256 points) external",
  "function awardPointsForLike(address user, uint256 postId, uint256 points) external",
  "function awardPointsForComment(address user, uint256 postId, uint256 commentId, uint256 points) external",
  "function awardPointsForShare(address user, uint256 postId, uint256 points) external",
  "function awardPointsForDonation(address donor, address recipient, uint256 postId, uint256 amount, uint256 points) external",
  // Events
  "event PointsAwarded(address indexed user, uint256 points, string actionType, uint256 indexed postId)"
];

// Contract address on Optimism Sepolia
const POINTS_CONTRACT_ADDRESS = "0x7d22772c139aada1a5112ea7553a4ccfc46930d0";

// Network details for Optimism Sepolia
const OPTIMISM_SEPOLIA_CONFIG = {
  chainId: 11155420, // Optimism Sepolia Chain ID
  name: 'Optimism Sepolia',
  rpcUrl: 'https://sepolia.optimism.io',
  blockExplorer: 'https://sepolia-optimistic.etherscan.io',
};

/**
 * Service class to interact with the Points Contract on Optimism
 */
export class PointsService {
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize with a read-only provider
    this.initializeReadOnly();
  }

  /**
   * Initialize with read-only access
   */
  private initializeReadOnly() {
    try {
      this.provider = new ethers.JsonRpcProvider(OPTIMISM_SEPOLIA_CONFIG.rpcUrl);
      this.contract = new ethers.Contract(
        POINTS_CONTRACT_ADDRESS,
        POINTS_CONTRACT_ABI,
        this.provider
      );
      console.log('Points service initialized in read-only mode');
    } catch (error) {
      console.error('Failed to initialize points service:', error);
    }
  }

  /**
   * Initialize with a signer for write operations
   * @param walletProvider Ethereum provider with signer
   */
  public async initializeWithSigner(walletProvider: any) {
    try {
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      this.signer = await ethersProvider.getSigner();
      this.contract = new ethers.Contract(
        POINTS_CONTRACT_ADDRESS,
        POINTS_CONTRACT_ABI,
        this.signer
      );
      console.log('Points service initialized with signer');
      return true;
    } catch (error) {
      console.error('Failed to initialize points service with signer:', error);
      return false;
    }
  }

  /**
   * Get points for a specific user
   * @param userAddress Ethereum address of the user
   */
  public async getUserPoints(userAddress: string): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      const points = await this.contract.getUserPoints(userAddress);
      return parseInt(points.toString());
    } catch (error) {
      console.error(`Error getting points for user ${userAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get points for a specific post
   * @param postId ID of the post
   */
  public async getPostPoints(postId: string): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Convert string postId to a numeric id if needed
      const numericPostId = parseInt(postId, 16);
      const points = await this.contract.getPostPoints(numericPostId);
      return parseInt(points.toString());
    } catch (error) {
      console.error(`Error getting points for post ${postId}:`, error);
      return 0;
    }
  }

  /**
   * Award points for creating a post
   * @param userAddress User's ethereum address
   * @param postId Post identifier
   * @param points Number of points to award
   */
  public async awardPointsForPost(
    userAddress: string,
    postId: string,
    points: number = 5
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized with signer');
      }
      
      // Convert string postId to a numeric id if needed
      const numericPostId = parseInt(postId, 16);
      
      const tx = await this.contract.awardPointsForPost(
        userAddress,
        numericPostId,
        points
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error awarding points for post:', error);
      return false;
    }
  }

  /**
   * Award points for liking a post
   * @param userAddress User's ethereum address
   * @param postId Post identifier
   * @param points Number of points to award
   */
  public async awardPointsForLike(
    userAddress: string,
    postId: string,
    points: number = 1
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized with signer');
      }
      
      // Convert string postId to a numeric id if needed
      const numericPostId = parseInt(postId, 16);
      
      const tx = await this.contract.awardPointsForLike(
        userAddress,
        numericPostId,
        points
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error awarding points for like:', error);
      return false;
    }
  }

  /**
   * Award points for commenting on a post
   * @param userAddress User's ethereum address
   * @param postId Post identifier
   * @param commentId Comment identifier
   * @param points Number of points to award
   */
  public async awardPointsForComment(
    userAddress: string,
    postId: string,
    commentId: string,
    points: number = 2
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized with signer');
      }
      
      // Convert string IDs to numeric ids if needed
      const numericPostId = parseInt(postId, 16);
      const numericCommentId = parseInt(commentId, 16);
      
      const tx = await this.contract.awardPointsForComment(
        userAddress,
        numericPostId,
        numericCommentId,
        points
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error awarding points for comment:', error);
      return false;
    }
  }

  /**
   * Award points for sharing a post
   * @param userAddress User's ethereum address
   * @param postId Post identifier
   * @param points Number of points to award
   */
  public async awardPointsForShare(
    userAddress: string,
    postId: string,
    points: number = 3
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized with signer');
      }
      
      // Convert string postId to a numeric id if needed
      const numericPostId = parseInt(postId, 16);
      
      const tx = await this.contract.awardPointsForShare(
        userAddress,
        numericPostId,
        points
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error awarding points for share:', error);
      return false;
    }
  }

  /**
   * Award points for donating to a post
   * @param donorAddress Donor's ethereum address
   * @param recipientAddress Recipient's ethereum address
   * @param postId Post identifier
   * @param amount Donation amount
   * @param points Number of points to award
   */
  public async awardPointsForDonation(
    donorAddress: string,
    recipientAddress: string,
    postId: string,
    amount: number,
    points: number = 5
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized with signer');
      }
      
      // Convert string postId to a numeric id if needed
      const numericPostId = parseInt(postId, 16);
      
      const tx = await this.contract.awardPointsForDonation(
        donorAddress,
        recipientAddress,
        numericPostId,
        amount,
        points
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error awarding points for donation:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const pointsService = new PointsService();

/**
 * Hook to get points for the current user
 */
export function useUserPoints(userAddress?: string) {
  const { user, authenticated } = usePrivy();
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!authenticated || (!userAddress && !user?.wallet?.address)) {
        setLoading(false);
        return;
      }

      try {
        const address = userAddress || user?.wallet?.address || '';
        const userPoints = await pointsService.getUserPoints(address);
        setPoints(userPoints);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user points:', err);
        setError(err.message || 'Failed to fetch points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [authenticated, user, userAddress]);

  return { points, loading, error };
}

/**
 * Hook to get points for a specific post
 */
export function usePostPoints(postId: string) {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        const postPoints = await pointsService.getPostPoints(postId);
        setPoints(postPoints);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching points for post ${postId}:`, err);
        setError(err.message || 'Failed to fetch post points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [postId]);

  return { points, loading, error };
}

/**
 * Hook to get total points in the system
 */
export function useTotalPoints() {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      try {
        if (!pointsService.contract) {
          console.warn('Points contract not initialized');
          setLoading(false);
          return;
        }
        
        const points = await pointsService.contract.getTotalPoints();
        setTotalPoints(parseInt(points.toString()));
        setError(null);
      } catch (err: any) {
        console.error('Error fetching total points:', err);
        setError(err.message || 'Failed to fetch total points');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPoints();
  }, []);

  return { totalPoints, loading, error };
}