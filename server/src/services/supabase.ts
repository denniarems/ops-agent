import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 *
 * Provides a configured Supabase client for database operations
 * with AWS credentials storage functionality
 */

// Database schema type definition
export interface Database {
  public: {
    Tables: {
      aws_data: {
        Row: {
          id: number
          created_at: string
          user_id: string
          key_id: string
          access_key: string
          region: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          key_id: string
          access_key: string
          region?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          key_id?: string
          access_key?: string
          region?: string | null
        }
      }
    }
  }
}

// Supabase configuration
const SUPABASE_URL = 'https://yersrscnfjaehfzevwuz.supabase.co'

/**
 * Create Supabase client with environment-based configuration
 */
export function createSupabaseClient(supabaseKey?: string): SupabaseClient<Database> {
  const key = supabaseKey || process.env.SUPABASE_KEY

  if (!key) {
    throw new Error('SUPABASE_KEY environment variable is required')
  }

  return createClient<Database>(SUPABASE_URL, key)
}

/**
 * AWS Data interface matching the database schema
 */
export interface AWSData {
  id?: number
  created_at?: string
  user_id: string
  key_id: string
  access_key: string
  region: string | null
}

/**
 * AWS Data Service
 *
 * Handles CRUD operations for AWS credentials in Supabase
 */
export class AWSDataService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseKey?: string) {
    this.supabase = createSupabaseClient(supabaseKey)
  }

  /**
   * Get AWS data for a specific user
   */
  async getAWSData(userId: string): Promise<AWSData | null> {
    const { data, error } = await this.supabase
      .from('aws_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      throw new Error(`Failed to get AWS data: ${error.message}`)
    }

    return data as AWSData
  }

  /**
   * Create or update AWS data for a user
   */
  async upsertAWSData(awsData: Omit<AWSData, 'id' | 'created_at'>): Promise<AWSData> {
    // First, try to get existing data for the user
    const existingData = await this.getAWSData(awsData.user_id)

    if (existingData) {
      // Update existing record
      const { data, error } = await this.supabase
        .from('aws_data')
        .update({
          key_id: awsData.key_id,
          access_key: awsData.access_key,
          region: awsData.region,
        })
        .eq('user_id', awsData.user_id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update AWS data: ${error.message}`)
      }

      return data as AWSData
    } else {
      // Insert new record
      const { data, error } = await this.supabase
        .from('aws_data')
        .insert({
          user_id: awsData.user_id,
          key_id: awsData.key_id,
          access_key: awsData.access_key,
          region: awsData.region,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to insert AWS data: ${error.message}`)
      }

      return data as AWSData
    }
  }

  /**
   * Delete AWS data for a user
   */
  async deleteAWSData(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('aws_data')
      .delete()
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete AWS data: ${error.message}`)
    }
  }

  /**
   * Check if user has AWS data
   */
  async hasAWSData(userId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('aws_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to check AWS data existence: ${error.message}`)
    }

    return (count || 0) > 0
  }
}

export default AWSDataService
