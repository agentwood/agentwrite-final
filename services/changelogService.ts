import { supabase } from './supabaseClient';

export interface ChangelogEntry {
    id: string;
    title: string;
    description: string;
    date: string;
    category: 'feature' | 'improvement' | 'fix' | 'announcement';
    tags: string[];
    version?: string;
    published: boolean;
}

export const changelogService = {
    async getAllEntries(category?: string, searchQuery?: string): Promise<ChangelogEntry[]> {
        if (!supabase) {
            return [];
        }

        let query = supabase
            .from('changelog_entries')
            .select('*')
            .eq('published', true)
            .order('date', { ascending: false });

        if (category && category !== 'All') {
            query = query.eq('category', category.toLowerCase());
        }

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching changelog entries:', error);
            return [];
        }

        return (data || []).map(entry => ({
            id: entry.id,
            title: entry.title,
            description: entry.description,
            date: entry.date,
            category: entry.category,
            tags: entry.tags || [],
            version: entry.version,
            published: entry.published,
        }));
    },

    async getEntryById(id: string): Promise<ChangelogEntry | null> {
        if (!supabase) {
            return null;
        }

        const { data, error } = await supabase
            .from('changelog_entries')
            .select('*')
            .eq('id', id)
            .eq('published', true)
            .single();

        if (error || !data) {
            console.error('Error fetching changelog entry:', error);
            return null;
        }

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            date: data.date,
            category: data.category,
            tags: data.tags || [],
            version: data.version,
            published: data.published,
        };
    },
};





