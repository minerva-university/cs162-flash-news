# Flash News Project

Flash News is a web application designed to allow users to share and explore news articles through a social feed. Posts on Flash News are ephemeral, disappearing after 24 hours, creating a sense of immediacy and anchoring users in the present moment. The platform provides features like collections, tags, and the ability to follow users for a more curated news-sharing experience.

Flash News addresses the issue of echo chambers and political polarity by allowing users to see the news articles their friends, peers, or public figures are consuming. This app serves as a medium for broadening perspectives by offering insight into the sources and narratives shaping others' viewpoints. It is distinct from other social media platforms as it focuses solely on news sharing without the distractions of memes, videos, or unrelated content.

The app is particularly useful for intellectually curious and politically engaged users who wish to share thought-provoking journalism or gain a mental map of the ideologies within their social circles. By fostering an environment for sharing and exploring news, Flash News aims to spark meaningful conversations both online and offline.

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Core Features](#core-features)
- [Project Members](#project-members)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Flash News is a platform where users can:
- Share news articles with their followers.
- Organize articles into collections (public or private).
- Interact with posts via likes, comments, and tags.
- View and explore a personalized feed.

The project follows a modular structure for backend and frontend.

---

## File Structure

### Backend

The backend is written in Python using the Flask framework. It provides APIs for authentication, posts, collections, comments, and more.

```
backend/
├── app/
│   ├── __init__.py       # Flask app initialization
│   ├── auth.py           # Authentication routes and logic
│   ├── collection.py     # API for managing collections
│   ├── comment.py        # API for comments on posts
│   ├── like.py           # API for likes on posts and comments
│   ├── models.py         # Database models
│   ├── og.py             # Open Graph functionality
│   ├── post.py           # API for managing posts
│   ├── user.py           # API for user profiles and follow functionality
│   ├── user2.py          # Secondary user utilities
│   ├── utils.py          # Helper utilities
├── README.md             # Backend documentation
├── requirements.txt      # Python dependencies
```

### Frontend

The frontend is built with React and uses Material UI for styling and Chakra UI for flexibility in components.

```
frontend/
├── public/               # Static files for the React app
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
├── src/                  # Source code for the React app
│   ├── components/       # Reusable React components
│   │   ├── ArticleCard.js
│   │   ├── CollectionCard.js
│   │   ├── Header.js
│   │   ├── MultipleSelectChip.js
│   │   ├── PostCard.js
│   ├── controllers/      # Controllers for handling page-specific logic
│   │   ├── PostController.js
│   │   ├── TagsController.js
│   ├── forms/            # Forms for user interactions
│   │   ├── AddPostForm.js
│   │   ├── ResetPasswordForm.js
│   ├── modals/           # Modals for additional UI features
│   │   ├── CollectionDetailModal.js
│   ├── pages/            # Page-level components for the app
│   ├── App.js            # Main React component
│   ├── App.css           # Global styles
│   ├── index.js          # Entry point for the app
├── package.json          # Project dependencies
├── README.md             # Frontend documentation
```

---

## Setup Instructions

### Backend Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run the Server:**
   ```bash
   flask run
   ```

3. **Environment Variables:**
   Ensure you have the necessary `.env` file with configuration for database credentials and API keys.

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm start
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Core Features

### Backend
- User authentication (email/password and Google OAuth).
- APIs for creating, retrieving, updating, and deleting posts.
- Support for collections (public/private) and tagging.
- Like and comment functionality.

### Frontend
- Responsive design using Material UI and Chakra UI.
- User-friendly interfaces for sharing posts and managing collections.
- Interactive feed with real-time updates.

---

## Project Members

- Add the list of project members here.
  - Flávia Iespa
  - Wisdom Ifode
  - Mototada Furuta
  - Candace Lee
  - Laryssa Coe
  - Pei Qi Tea

---

## Contributing

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and open a pull request.

### Development Guidelines
- Follow the file structure for modularity.
- Write clear commit messages.
- Ensure your code passes all linting and testing checks.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

