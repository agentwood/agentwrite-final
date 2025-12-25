import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
let supabaseUrl, supabaseKey;
try {
  const envFile = readFileSync(join(__dirname, '..', '.env'), 'utf8');
  const envLines = envFile.split('\n');
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1]?.trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1]?.trim();
    }
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🔍 DIAGNOSING POSTS ISSUE\n');
console.log('='.repeat(60));

// Check ALL posts regardless of status
console.log('\n1. Checking ALL posts (any status):');
try {
  const { data: allPosts, error: allError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, published_at, category')
    .order('created_at', { ascending: false });

  if (allError) {
    console.log('   ❌ Error:', allError.message);
  } else {
    console.log(`   ✅ Found ${allPosts?.length || 0} total posts`);
    if (allPosts && allPosts.length > 0) {
      console.log('\n   Posts by status:');
      const byStatus = {};
      allPosts.forEach(post => {
        byStatus[post.status] = (byStatus[post.status] || 0) + 1;
      });
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });
      
      console.log('\n   All posts:');
      allPosts.forEach((post, i) => {
        console.log(`   ${i + 1}. [${post.status}] ${post.title}`);
        console.log(`      Slug: ${post.slug}`);
        console.log(`      Published: ${post.published_at || 'N/A'}`);
      });
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Check published posts specifically
console.log('\n2. Checking PUBLISHED posts only:');
try {
  const { data: publishedPosts, error: pubError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, published_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (pubError) {
    console.log('   ❌ Error:', pubError.message);
    console.log('   Details:', pubError.details);
    console.log('   Hint:', pubError.hint);
  } else {
    console.log(`   ✅ Found ${publishedPosts?.length || 0} published posts`);
    if (publishedPosts && publishedPosts.length > 0) {
      publishedPosts.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.title} (${post.category})`);
      });
    } else {
      console.log('   ⚠️  No published posts found!');
      console.log('   → Check if seed SQL was run successfully');
      console.log('   → Verify posts have status = "published"');
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Test the exact query the app uses
console.log('\n3. Testing exact app query:');
try {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.log('   ❌ Query failed:', error.message);
    console.log('   Code:', error.code);
    console.log('   Details:', error.details);
  } else {
    console.log(`   ✅ Query successful: ${data?.length || 0} rows`);
    if (data && data.length > 0) {
      console.log('   First post sample:');
      const first = data[0];
      console.log('      Title:', first.title);
      console.log('      Status:', first.status);
      console.log('      Published:', first.published_at);
      console.log('      Category:', first.category);
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 SUMMARY:');
console.log('   If you see posts but status is not "published":');
console.log('   → Update them: UPDATE blog_posts SET status = \'published\' WHERE status != \'published\';');
console.log('   If you see 0 posts total:');
console.log('   → Run database/seed_data_writing.sql in Supabase SQL Editor');
console.log('\n');



