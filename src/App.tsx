import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import "./App.css";

interface Post {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "/api";

  const fetchPosts = async () => {
    if (posts.length === 0 && !isLoadingPosts) {
      setIsLoadingPosts(true);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (parseError) {
          console.warn(
            "Could not parse error JSON from backend on fetch",
            parseError
          );
        }
        throw new Error(errorMessage);
      }
      const data: Post[] = await response.json();
      setPosts(data);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch posts:", err);
      if (posts.length === 0) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("Could not fetch posts due to an unknown error.");
        }
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const intervalId = setInterval(fetchPosts, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Message content cannot be empty.");
      return;
    }
    setIsSubmittingPost(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: author.trim(),
          content: content.trim(),
        }),
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (parseError) {
          console.warn(
            "Could not parse error JSON from backend on submit",
            parseError
          );
        }
        throw new Error(errorMessage);
      }
      const newPost: Post = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setContent("");
    } catch (err: unknown) {
      console.error("Failed to submit post:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("Could not submit post due to an unknown error.");
      }
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <div className="container">
      <h1>MIX NYC Mixed Connections</h1>
      <form onSubmit={handleSubmit} className="post-form">
        <div>
          <label htmlFor="author">Name (Optional):</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
            disabled={isSubmittingPost}
          />
        </div>
        <div>
          <label htmlFor="content">Message:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            required
            disabled={isSubmittingPost}
          />
        </div>
        <button type="submit" disabled={isSubmittingPost}>
          {isSubmittingPost ? "Posting..." : "Post Message"}
        </button>
      </form>

      {error && <p className="error-message">Error: {error}</p>}

      <div className="posts-list">
        <h2>Messages:</h2>
        {isLoadingPosts && posts.length === 0 && (
          <p className="loading-text">Loading messages...</p>
        )}
        {!isLoadingPosts && posts.length === 0 && !error && (
          <p>No messages yet. Be the first to post!</p>
        )}
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <p className="post-content">{post.content}</p>
              <div className="post-meta">
                <span>
                  By: <strong>{post.author || "Anonymous"}</strong>
                </span>
                <br />
                <span>At: {new Date(post.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
