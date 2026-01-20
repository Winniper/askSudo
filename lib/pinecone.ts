import { Pinecone } from "@pinecone-database/pinecone"

const globalForPinecone = global as unknown as {
    pinecone: Pinecone
}

export const pinecone =
    globalForPinecone.pinecone || new Pinecone()

if (process.env.NODE_ENV !== "production") globalForPinecone.pinecone = pinecone

// Default index name - update if using a different name
export const PINECONE_INDEX_NAME = "asksudo"

export function getPineconeIndex() {
    return pinecone.index(PINECONE_INDEX_NAME)
}
