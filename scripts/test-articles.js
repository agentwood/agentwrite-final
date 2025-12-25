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
}

console.log('\n🔍 Testing Articles Page Setup\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n1. Environment Variables:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables!');
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
console.log('\n2. Testing Supabase Connection:');
try {
  const { data: testData, error: testError } = await supabase
    .from('blog_posts')
    .select('count')
    .limit(1);
  
  if (testError) {
    console.log('   ❌ Connection failed:', testError.message);
    if (testError.message.includes('relation "blog_posts" does not exist')) {
      console.log('   ⚠️  blog_posts table does not exist!');
      console.log('   → Run database/complete_migration.sql in Supabase SQL Editor');
    }
  } else {
    console.log('   ✅ Connection successful');
  }
} catch (error) {
  console.log('   ❌ Connection error:', error.message);
}

// Check for published posts
console.log('\n3. Checking Published Posts:');
try {
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, published_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (postsError) {
    console.log('   ❌ Query failed:', postsError.message);
  } else {
    console.log(`   ✅ Found ${posts?.length || 0} published posts`);
    
    if (posts && posts.length > 0) {
      console.log('\n   Published Posts:');
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
        console.log(`      Category: ${post.category}`);
        console.log(`      Slug: ${post.slug}`);
        console.log(`      Published: ${new Date(post.published_at).toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No published posts found!');
      console.log('   → Run database/seed_data_writing.sql to add sample posts');
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Check categories
console.log('\n4. Checking Categories:');
try {
  const { data: categories, error: categoriesError } = await supabase
    .from('blog_categories')
    .select('name, slug');

  if (categoriesError) {
    console.log('   ❌ Query failed:', categoriesError.message);
  } else {
    console.log(`   ✅ Found ${categories?.length || 0} categories`);
    if (categories && categories.length > 0) {
      console.log('   Categories:', categories.map(c => c.name).join(', '));
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('\n📋 Summary:');
console.log('   1. Check if dev server is running: npm run dev');
console.log('   2. Navigate to: http://localhost:5173/#/articles');
console.log('   3. Open browser DevTools (F12) and check Console');
console.log('   4. Look for debug logs starting with [ArticlesPage]');
console.log('\n');

