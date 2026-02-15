import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Path to posts data file
const dataPath = join(process.cwd(), 'src/data/posts.json');

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getPosts(req, res);
        case 'POST':
            return createPost(req, res);
        case 'PUT':
            return updatePost(req, res);
        case 'DELETE':
            return deletePost(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

// Get all posts
function getPosts(req, res) {
    try {
        const data = readFileSync(dataPath, 'utf8');
        const posts = JSON.parse(data);
        return res.status(200).json(posts);
    } catch (error) {
        console.error('Error reading posts:', error);
        return res.status(500).json({ message: 'Failed to load posts' });
    }
}

// Create new post
function createPost(req, res) {
    try {
        const data = readFileSync(dataPath, 'utf8');
        const posts = JSON.parse(data);
        
        const newPost = {
            id: Date.now().toString(),
            ...req.body,
            date: new Date().toISOString().split('T')[0]
        };
        
        posts.posts.unshift(newPost);
        writeFileSync(dataPath, JSON.stringify(posts, null, 2));
        
        return res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Failed to create post' });
    }
}

// Update existing post
function updatePost(req, res) {
    try {
        const { id } = req.query;
        const data = readFileSync(dataPath, 'utf8');
        const posts = JSON.parse(data);
        
        const index = posts.posts.findIndex(post => post.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        posts.posts[index] = { ...posts.posts[index], ...req.body };
        writeFileSync(dataPath, JSON.stringify(posts, null, 2));
        
        return res.status(200).json(posts.posts[index]);
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Failed to update post' });
    }
}

// Delete post
function deletePost(req, res) {
    try {
        const { id } = req.query;
        const data = readFileSync(dataPath, 'utf8');
        const posts = JSON.parse(data);
        
        const filteredPosts = posts.posts.filter(post => post.id !== id);
        posts.posts = filteredPosts;
        
        writeFileSync(dataPath, JSON.stringify(posts, null, 2));
        
        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Failed to delete post' });
    }
}