import { getSortedPostsData, getPostData } from '../lib/blog/service';
import { generateBlogMetadata } from '../lib/seo/metadata';

async function testBlogSystem() {
    console.log('=== Testing Blog System ===\n');

    try {
        const posts = await getSortedPostsData();
        console.log(`Found ${posts.length} blog posts:`);
        posts.forEach(p => console.log(` - [${p.date}] ${p.title} (${p.slug})`));

        if (posts.length > 0) {
            const firstPost = await getPostData(posts[0].slug);
            console.log(`\nVerifying content for: ${firstPost.title}`);
            console.log(`  Content length: ${firstPost.contentHtml?.length} characters`);

            const metadata = generateBlogMetadata(firstPost);
            console.log('\nVerifying Metadata:');
            console.log(`  Title: ${metadata.title}`);
            console.log(`  Canonical: ${metadata.alternates?.canonical}`);
            console.log(`  OG Description: ${metadata.openGraph?.description}`);
        }

        console.log('\n✅ Blog System Test Passed!');
    } catch (error) {
        console.error('\n❌ Blog System Test Failed:', error);
    }
}

testBlogSystem();
