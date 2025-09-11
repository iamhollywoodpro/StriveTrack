// Simple script to add test media data for admin testing

const testMediaData = [
    {
        id: 'test-media-1',
        user_id: 2, // Assuming user ID 2 exists (non-admin)
        type: 'image',
        file_name: 'progress-photo-1.jpg',
        file_size: 1024000,
        url: 'https://picsum.photos/400/300?random=1',
        upload_date: new Date().toISOString(),
        is_flagged: false,
        description: 'Progress photo - Week 1 transformation'
    },
    {
        id: 'test-media-2', 
        user_id: 2,
        type: 'video',
        file_name: 'workout-demo.mp4',
        file_size: 5242880,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        upload_date: new Date().toISOString(),
        is_flagged: false,
        description: 'Deadlift form check'
    },
    {
        id: 'test-media-3',
        user_id: 3, // Another test user
        type: 'image', 
        file_name: 'gym-selfie.jpg',
        file_size: 856432,
        url: 'https://picsum.photos/400/600?random=2',
        upload_date: new Date().toISOString(),
        is_flagged: true, // This one is flagged for admin review
        description: 'Post-workout selfie'
    },
    {
        id: 'test-media-4',
        user_id: 3,
        type: 'image',
        file_name: 'meal-prep.jpg', 
        file_size: 743210,
        url: 'https://picsum.photos/500/400?random=3',
        upload_date: new Date().toISOString(),
        is_flagged: false,
        description: 'Sunday meal prep - chicken and rice'
    }
];

console.log('Test media data ready for insertion:');
console.log(JSON.stringify(testMediaData, null, 2));

// Instructions for manual insertion
console.log('\n=== MANUAL INSERTION INSTRUCTIONS ===');
console.log('Use the Cloudflare dashboard or wrangler d1 execute to insert this data:');
testMediaData.forEach(media => {
    console.log(`\nINSERT INTO media_uploads (id, user_id, type, file_name, file_size, url, upload_date, is_flagged, description) VALUES ('${media.id}', ${media.user_id}, '${media.type}', '${media.file_name}', ${media.file_size}, '${media.url}', '${media.upload_date}', ${media.is_flagged ? 1 : 0}, '${media.description}');`);
});