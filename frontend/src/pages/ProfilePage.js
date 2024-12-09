import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import ArticleCard from "../components/ArticleCard";
import { Settings } from "@mui/icons-material";
import PostCard from "../components/PostCard";

const ProfilePage = ({ currentUser }) => {
  const DB_HOST = "http://127.0.0.1:5000/api";
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle collection click event (navigate to collection page)
  const handleCollectionClick = (collection) => {
    const formattedTitle = collection.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections/${collection.id}/${formattedTitle}`, {
      state: { collection },
    });
  };

  // Mock data for shared posts, collections, and articles (replace with actual data)
  const sharedPosts = [
    {
      username: "User1",
      profile_picture: "",
      posted_at: "2024-11-26T10:30:00Z",
      preview: "https://via.placeholder.com/300",
      description: "Breaking News from CNN!",
      categories: ["Politics", "World"],
      liked: true,
      link: "https://cnn.com",
    },
    {
      username: "User2",
      profile_picture: "",
      posted_at: "2024-11-26T09:30:00Z",
      preview: "https://via.placeholder.com/300",
      description: "Opinion Piece from The Guardian.",
      categories: ["Opinion"],
      liked: false,
      link: "https://theguardian.com",
    },
  ];

  const collections = [
    {
      id: 1,
      name: "World News",
      description: "Stay updated with the latest global events and trends.",
      createdAt: "2024-11-20",
      articlesCount: 3,
      icon: "🌍",
      articles: [
        {
          title: "Global Climate Summit Highlights",
          source: "BBC News",
          description:
            "World leaders discuss strategies to combat climate change in the annual summit.",
          category: "Environment",
          author: "John Smith",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "Breaking News: Historic Peace Agreement Signed",
          source: "CNN",
          description:
            "Two nations have signed a historic peace agreement ending decades of conflict.",
          category: "World",
          author: "Emily White",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "Economic Reforms in South America",
          source: "Al Jazeera",
          description:
            "South American nations agree on unified economic reforms to boost trade.",
          category: "Finance",
          author: "Carlos Martinez",
          image: "https://via.placeholder.com/300x150",
        },
      ],
    },
    {
      id: 2,
      name: "Tech Trends",
      description: "The latest in AI, software, and hardware advancements.",
      createdAt: "2024-11-15",
      articlesCount: 3,
      icon: "💻",
      articles: [
        {
          title: "AI Breakthrough in 2024",
          source: "TechCrunch",
          description:
            "Researchers have developed a new AI model that outperforms GPT-4 in language tasks.",
          category: "Technology",
          author: "Jane Doe",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "Stock Market Update: Tech Stocks Surge",
          source: "Wall Street Journal",
          description:
            "Tech companies report record earnings, pushing the Nasdaq to new highs.",
          category: "Finance",
          author: "Sarah Lee",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "Quantum Computing Reaches New Milestone",
          source: "MIT Technology Review",
          description:
            "A new quantum algorithm promises to revolutionize cryptography.",
          category: "Innovation",
          author: "Adam Smith",
          image: "https://via.placeholder.com/300x150",
        },
      ],
    },
  ];

  const allArticles = [
    {
      title: "AI Breakthrough in 2024",
      source: "TechCrunch",
      description:
        "A new AI model surpasses GPT-4 in language processing tasks.",
      category: "Technology",
      author: "Jane Doe",
      image: "https://via.placeholder.com/300x150",
      link: "https://techcrunch.com",
    },
    {
      title: "Global Climate Change Summit",
      source: "BBC News",
      description:
        "Leaders discuss climate change strategies in this year's summit.",
      category: "Environment",
      author: "John Smith",
      image: "https://via.placeholder.com/300x150",
      link: "https://bbc.com",
    },
    {
      title: "Economic Reforms in Asia",
      source: "Al Jazeera",
      description:
        "Countries agree on trade reforms to boost economic growth in Asia.",
      category: "Finance",
      author: "Carlos Martinez",
      image: "https://via.placeholder.com/300x150",
      link: "https://aljazeera.com",
    },
    {
      title: "Astronomy Breakthrough with James Webb Telescope",
      source: "NASA",
      description:
        "New images captured by the James Webb Telescope reveal distant galaxies.",
      category: "Space",
      author: "Dr. Alan Green",
      image: "https://via.placeholder.com/300x150",
      link: "https://nasa.gov",
    },
    {
      title: "The Future of Remote Work",
      source: "Forbes",
      description: "How remote work trends are shaping the global economy.",
      category: "Business",
      author: "Emily Chen",
      image: "https://via.placeholder.com/300x150",
      link: "https://forbes.com",
    },
    {
      title: "Advancements in Renewable Energy",
      source: "The Guardian",
      description:
        "Solar and wind energy projects see significant technological progress.",
      category: "Environment",
      author: "Sarah Johnson",
      image: "https://via.placeholder.com/300x150",
      link: "https://theguardian.com",
    },
    {
      title: "Breakthrough in Cancer Treatment",
      source: "Nature",
      description:
        "A new drug shows promise in clinical trials for lung cancer.",
      category: "Health",
      author: "Michael Brown",
      image: "https://via.placeholder.com/300x150",
      link: "https://nature.com",
    },
    {
      title: "The Evolution of Electric Vehicles",
      source: "Wired",
      description:
        "New EV models offer longer ranges and improved performance.",
      category: "Automotive",
      author: "Alex Green",
      image: "https://via.placeholder.com/300x150",
      link: "https://wired.com",
    },
    {
      title: "Exploring the Metaverse",
      source: "TechRadar",
      description:
        "How the metaverse is transforming virtual interactions and gaming.",
      category: "Technology",
      author: "Rachel Lee",
      image: "https://via.placeholder.com/300x150",
      link: "https://techradar.com",
    },
    {
      title: "The Rise of Quantum Computing",
      source: "MIT Technology Review",
      description:
        "Quantum computing could revolutionize cryptography and AI development.",
      category: "Technology",
      author: "Adam Smith",
      image: "https://via.placeholder.com/300x150",
      link: "https://technologyreview.com",
    },
    {
      title: "Mars Mission Updates",
      source: "Space.com",
      description: "NASA shares new insights from its Mars rover exploration.",
      category: "Space",
      author: "Helen White",
      image: "https://via.placeholder.com/300x150",
      link: "https://space.com",
    },
    {
      title: "Impact of Social Media on Mental Health",
      source: "Psychology Today",
      description:
        "Studies reveal both positive and negative effects of social media usage.",
      category: "Health",
      author: "Anna Kim",
      image: "https://via.placeholder.com/300x150",
      link: "https://psychologytoday.com",
    },
    {
      title: "Advancements in Biotechnology",
      source: "Scientific American",
      description: "New CRISPR techniques are enabling targeted gene therapy.",
      category: "Science",
      author: "Dr. Richard Nguyen",
      image: "https://via.placeholder.com/300x150",
      link: "https://scientificamerican.com",
    },
    {
      title: "Global Trends in Renewable Energy",
      source: "Bloomberg",
      description:
        "Wind and solar power become the fastest-growing energy sources.",
      category: "Environment",
      author: "Natalie Fox",
      image: "https://via.placeholder.com/300x150",
      link: "https://bloomberg.com",
    },
    {
      title: "Art Market Booms in 2024",
      source: "ArtDaily",
      description: "Collectors and investors focus on contemporary art.",
      category: "Art",
      author: "James White",
      image: "https://via.placeholder.com/300x150",
      link: "https://artdaily.com",
    },
    {
      title: "The Rise of E-Sports",
      source: "ESPN",
      description: "E-sports events attract millions of viewers worldwide.",
      category: "Sports",
      author: "Kevin Brown",
      image: "https://via.placeholder.com/300x150",
      link: "https://espn.com",
    },
    {
      title: "Breakthroughs in Space Exploration",
      source: "SpaceX",
      description:
        "Starship achieves a successful launch and landing sequence.",
      category: "Space",
      author: "Elon Musk",
      image: "https://via.placeholder.com/300x150",
      link: "https://spacex.com",
    },
    {
      title: "Global Water Crisis",
      source: "National Geographic",
      description: "How communities are adapting to severe water shortages.",
      category: "Environment",
      author: "Sophia Carter",
      image: "https://via.placeholder.com/300x150",
      link: "https://nationalgeographic.com",
    },
    {
      title: "The Future of Blockchain Technology",
      source: "CoinDesk",
      description:
        "Applications of blockchain expand beyond cryptocurrency into various industries.",
      category: "Technology",
      author: "Nathan Blake",
      image: "https://via.placeholder.com/300x150",
      link: "https://coindesk.com",
    },
    {
      title: "Healthcare Innovations in 2024",
      source: "MedTech News",
      description:
        "New wearable devices provide real-time health monitoring solutions.",
      category: "Health",
      author: "Laura Andrews",
      image: "https://via.placeholder.com/300x150",
      link: "https://medtechnews.com",
    },
  ];

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${DB_HOST}/user/profile/${username}`);
      const data = await response.json();

      if (response.ok) {
        setProfileData(data);
        setIsOwner(currentUser?.username === username);
      } else {
        console.error("Failed to fetch profile data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ textAlign: "center", marginTop: "40px" }}>
        <Typography variant="h5" sx={{ color: "gray" }}>
          User not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "32px",
        backgroundColor: "#f4f3ef",
        minHeight: "100vh",
      }}
    >
      {/* Profile Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#5F848C",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "32px",
        }}
      >
        {/* Avatar Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Avatar sx={{ width: 80, height: 80, bgcolor: "#fff" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#D9EAF3",
              }}
            >
              {profileData.username}
            </Typography>
            {profileData.bio_description ? (
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#a6b2bb",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {profileData.bio_description}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: "#a6b2bb",
                  fontStyle: "italic",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                No bio available.
              </Typography>
            )}
            {profileData.tags.length > 0 && (
              <Box sx={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {profileData.tags.map((tag, index) => (
                  <Typography
                    key={index}
                    sx={{
                      backgroundColor: "#D9EAF3",
                      color: "#5F848C",
                      borderRadius: "12px",
                      padding: "4px 8px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {tag}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Settings Button */}
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<Settings />}
            sx={{
              backgroundColor: "#D9EAF3",
              color: "#5F848C",
              fontWeight: "bold",
              fontFamily: "'Raleway', sans-serif",
              "&:hover": {
                backgroundColor: "#6b949c",
              },
            }}
            onClick={() => navigate(`/${username}/settings`)}
          >
            Settings
          </Button>
        )}
      </Box>

      {/* Most Recent Posts Section */}
      <Box
        sx={{
          marginBottom: "40px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#266a7a",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Recently Shared Posts
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "30px",
            padding: "20px 0",
          }}
        >
          {sharedPosts.slice(0, 3).map(
            (
              post,
              index, 
            ) => (
              <Box
                key={index}
                sx={{
                  width: "500px",
                  margin: "0 10px",
                }}
              >
                {/* <PostCard post={post} /> */}
              </Box>
            ),
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Divider
        sx={{
          margin: "40px 0",
          backgroundColor: "#266a7a",
          opacity: 0.5,
        }}
      />

      {/* Most Recent Public Collections Section */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#266a7a",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Most Recent Public Collections
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
        }}
      >
        {collections.map((collection, index) => (
          <Box
            key={index}
            onClick={() => handleCollectionClick(collection)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <Box
              sx={{
                width: "80px",
                height: "80px",
                backgroundColor: "#D9EAF3",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                color: "#5F848C",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {collection.icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                marginTop: "8px",
                color: "#5F848C",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {collection.name} Collection
            </Typography>
          </Box>
        ))}
      </Box>

      {isOwner && (
        <>
          {/* Divider */}
          <Divider
            sx={{
              margin: "40px 0",
              backgroundColor: "#266a7a",
              opacity: 0.5,
            }}
          />
          {/* All Articles Section */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#266a7a",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            All Articles
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {allArticles.map((article, index) => (
              <ArticleCard
                key={index}
                article={article}
                isOwner={true} // TODO: check user ownership
                // TODO: Implement edit and delete functionality (log for now)
                onEdit={(article) => console.log("Edit clicked for", article)}
                onDelete={(article) =>
                  console.log("Delete clicked for", article)
                }
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProfilePage;