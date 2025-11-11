// client/cypress/e2e/posts.cy.js - Posts CRUD E2E tests

describe('Posts CRUD Operations', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/api/test/reset-db');
    cy.login('test@example.com', 'password123');
  });

  it('should create a new post', () => {
    cy.visit('/posts/create');

    const postTitle = 'Test Post Title';
    const postContent = 'This is a test post content for E2E testing.';

    cy.get('[data-cy="post-title-input"]').type(postTitle);
    cy.get('[data-cy="post-content-input"]').type(postContent);
    cy.get('[data-cy="post-category-select"]').select('Technology');
    cy.get('[data-cy="submit-post-button"]').click();

    // Should redirect to posts list or post detail
    cy.url().should('include', '/posts');
    cy.contains(postTitle).should('be.visible');
    cy.contains(postContent).should('be.visible');
  });

  it('should display posts list', () => {
    // Create a test post first
    cy.createPost('List Test Post', 'Content for list testing');

    cy.visit('/posts');

    cy.get('[data-cy="posts-list"]').should('be.visible');
    cy.get('[data-cy="post-item"]').should('have.length.at.least', 1);
    cy.contains('List Test Post').should('be.visible');
  });

  it('should view post details', () => {
    const title = 'Detail View Post';
    const content = 'Content for detail view testing';

    cy.createPost(title, content);

    cy.visit('/posts');
    cy.contains(title).click();

    cy.url().should('include', '/posts/');
    cy.get('[data-cy="post-title"]').should('contain', title);
    cy.get('[data-cy="post-content"]').should('contain', content);
    cy.get('[data-cy="post-author"]').should('be.visible');
  });

  it('should edit an existing post', () => {
    const originalTitle = 'Original Title';
    const originalContent = 'Original content';

    cy.createPost(originalTitle, originalContent);

    // Navigate to edit page
    cy.contains(originalTitle).click();
    cy.get('[data-cy="edit-post-button"]').click();

    const newTitle = 'Updated Title';
    const newContent = 'Updated content';

    cy.get('[data-cy="post-title-input"]').clear().type(newTitle);
    cy.get('[data-cy="post-content-input"]').clear().type(newContent);
    cy.get('[data-cy="submit-post-button"]').click();

    cy.contains(newTitle).should('be.visible');
    cy.contains(newContent).should('be.visible');
    cy.contains(originalTitle).should('not.exist');
  });

  it('should delete a post', () => {
    const title = 'Post to Delete';
    const content = 'This post will be deleted';

    cy.createPost(title, content);

    cy.visit('/posts');
    cy.contains(title).should('be.visible');

    // Click delete button and confirm
    cy.get('[data-cy="delete-post-button"]').first().click();
    cy.get('[data-cy="confirm-delete-button"]').click();

    cy.contains(title).should('not.exist');
    cy.shouldShowSuccess('Post deleted successfully');
  });

  it('should filter posts by category', () => {
    // Create posts in different categories
    cy.createPost('Tech Post', 'Technology content');
    cy.createPost('News Post', 'News content');

    cy.visit('/posts');

    // Filter by Technology category
    cy.get('[data-cy="category-filter"]').select('Technology');
    cy.contains('Tech Post').should('be.visible');
    cy.contains('News Post').should('not.be.visible');

    // Filter by News category
    cy.get('[data-cy="category-filter"]').select('News');
    cy.contains('News Post').should('be.visible');
    cy.contains('Tech Post').should('not.be.visible');
  });

  it('should paginate posts', () => {
    // Create multiple posts (more than page limit)
    for (let i = 1; i <= 15; i++) {
      cy.createPost(`Post ${i}`, `Content for post ${i}`);
    }

    cy.visit('/posts');

    // Should show pagination
    cy.get('[data-cy="pagination"]').should('be.visible');

    // Check first page
    cy.get('[data-cy="post-item"]').should('have.length', 10);

    // Go to next page
    cy.get('[data-cy="next-page-button"]').click();
    cy.get('[data-cy="post-item"]').should('have.length', 5);
  });
});