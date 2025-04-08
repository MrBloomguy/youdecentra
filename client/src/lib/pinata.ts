import axios from 'axios';

// Pinata API configuration
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;
const PINATA_GATEWAY = `https://${GATEWAY_URL}/ipfs/`;

/**
 * Upload a file to IPFS via Pinata
 * @param file The file to upload
 * @returns The IPFS URL of the uploaded file or null if upload failed
 */
export async function uploadFileToPinata(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);
    
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    if (response.status === 200) {
      return `${PINATA_GATEWAY}${response.data.IpfsHash}`;
    }
    
    throw new Error(`Pinata upload failed with status ${response.status}`);
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Pinata upload failed: ${error.response.data.message || error.message}`);
    }
    throw new Error('Failed to upload image to Pinata');
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param jsonData The JSON data to upload
 * @returns The IPFS URL of the uploaded JSON or null if upload failed
 */
export async function uploadJsonToPinata(jsonData: any): Promise<string | null> {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      }
    );
    
    if (response.status === 200) {
      return `${PINATA_GATEWAY}${response.data.IpfsHash}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    return null;
  }
}

/**
 * Upload multiple files to IPFS via Pinata
 * @param files Array of files to upload
 * @returns Array of IPFS URLs for each successfully uploaded file
 */
export async function uploadMultipleFilesToPinata(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToPinata(file));
  const results = await Promise.all(uploadPromises);
  
  // Filter out failed uploads (null values)
  return results.filter((url): url is string => url !== null);
}
