import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import CollectionCard from "../components/CollectionCard";

const CollectionsPage = ({ isOwner }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Search function to filter collections based on the search term
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Mock Data for Collections (replace with API calls later)
  const publicCollectionsMock = [
    {
      id: 1,
      name: "World News",
      description: "Stay updated with the latest global events and trends.",
      createdAt: "2024-11-20",
      articlesCount: 3,
      emoji: "📰",
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
      emoji: "💻",
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

  const privateCollectionsMock = [
    {
      id: 3,
      name: "Space Exploration",
      description: "Discover the mysteries of the universe.",
      createdAt: "2024-10-05",
      articlesCount: 2,
      emoji: "🚀",
      articles: [
        {
          title: "Mars Rover Discovers Evidence of Water",
          source: "NASA",
          description:
            "The Mars Rover has uncovered compelling evidence of ancient water flows on the red planet.",
          category: "Space",
          author: "Dr. Alan Green",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "James Webb Telescope Captures New Galaxy Images",
          source: "Space.com",
          description:
            "Stunning new images from the James Webb telescope show galaxies formed billions of years ago.",
          category: "Astronomy",
          author: "Dr. Helen White",
          image: "https://via.placeholder.com/300x150",
        },
      ],
    },
    {
      id: 4,
      name: "Health and Wellness",
      description: "Articles to help you lead a healthier life.",
      createdAt: "2024-09-25",
      articlesCount: 2,
      emoji: "🏋️",
      articles: [
        {
          title: "New Study Links Exercise to Longevity",
          source: "Nature Journal",
          description:
            "Scientists find that moderate daily exercise can significantly increase lifespan.",
          category: "Health",
          author: "Michael Brown",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "Meditation: A Path to Mental Clarity",
          source: "Psychology Today",
          description:
            "Practicing meditation for just 10 minutes a day can boost your mental clarity and focus.",
          category: "Wellness",
          author: "Anna Lee",
          image: "https://via.placeholder.com/300x150",
        },
      ],
    },
    {
      id: 5,
      name: "Travel and Adventure",
      description: "Explore the best travel destinations and adventure tips.",
      createdAt: "2024-08-30",
      articlesCount: 2,
      emoji: "✈️",
      articles: [
        {
          title: "Top 10 Destinations for 2024",
          source: "Lonely Planet",
          description:
            "Discover the most exciting travel destinations for the upcoming year.",
          category: "Travel",
          author: "Lisa Taylor",
          image: "https://via.placeholder.com/300x150",
        },
        {
          title: "How to Pack Light for Your Next Adventure",
          source: "National Geographic",
          description:
            "Essential tips for packing efficiently and traveling stress-free.",
          category: "Adventure",
          author: "Mark Wilson",
          image: "https://via.placeholder.com/300x150",
        },
      ],
    },
  ];

  const filteredPublicCollections = publicCollectionsMock.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm),
  );

  const filteredPrivateCollections = privateCollectionsMock.filter(
    (collection) => collection.name.toLowerCase().includes(searchTerm),
  );

  // Handle collection click event (navigate to collection page)
  const handleCollectionClick = (collection) => {
    const formattedTitle = collection.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections/${collection.id}/${formattedTitle}`, {
      state: { collection },
    }); // Pass data through state
  };

  // State
  const [publicCollections, setPublicCollections] = useState(
    publicCollectionsMock,
  );
  const [privateCollections, setPrivateCollections] = useState(
    privateCollectionsMock,
  );

  // TODO: Implement sorting by date for public and private collections
  const sortByDate = (isPublic) => {
    if (isPublic) {
      const sortedPublic = [...publicCollections].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setPublicCollections(sortedPublic);
    } else {
      const sortedPrivate = [...privateCollections].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setPrivateCollections(sortedPrivate);
    }
  };

  // TODO: Fetching collections articles function
  // Based on the user's ownership, fetch the appropriate collections
  // const fetchCollections = async (tab) => {
  //  try {
  //  // Placeholder for fetching logic
  // await fetch(`${<backend_host>}/collections?type=${tab}`
  // { method: "GET", headers: HEADERS_WITH_JWT(user) });
  //    console.log(`Fetching ${tab} collections...`);

  //    if (tab === "Public") {
  //      setPublicCollections([]); // Replace with actual data
  //    } else {
  //      setPrivateCollections([]); // Replace with actual data
  //    }
  //  } catch (error) {
  //    console.error("Error fetching collections:", error);
  //  }
  //};

  // Draft of useEffect for handling backend fetching when the active tab changes
  //useEffect(() => {
  //  fetchCollections(activeTab);
  //}, [activeTab]);

  return (
    <Box
      sx={{
        padding: "32px",
        minHeight: "100vh",
        backgroundColor: "#f4f3ef",
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          gap: "16px",
        }}
      >
        <Avatar sx={{ width: 80, height: 80, bgcolor: "#79A3B1" }} />
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto', sans-serif",
              color: "#333",
            }}
          >
            📁 My Collections
          </Typography>
          <Typography sx={{ color: "gray" }}>
            View and manage your saved news articles.
          </Typography>
        </Box>
        {isOwner && ( // Add button only if the user is the owner
          <Button
            variant="contained"
            sx={{
              marginLeft: "auto",
              backgroundColor: "#79A3B1",
              color: "#fff",
              fontWeight: "bold",
              fontFamily: "'Raleway', sans-serif",
              "&:hover": {
                backgroundColor: "#456268",
              },
            }}
          >
            Add New Collection
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box
        sx={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}
      >
        <TextField
          placeholder="Search Collections"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            width: "50%",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#DDD",
              },
              "&:hover fieldset": {
                borderColor: "#79A3B1",
              },
            },
          }}
        />
      </Box>

      {/* Public Collections */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          marginTop: "40px",
          marginBottom: "16px",
          textAlign: "center",
          fontFamily: "'Roboto', serif",
        }}
      >
        Public Collections
      </Typography>
      <Divider sx={{ marginBottom: "16px" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {filteredPublicCollections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onClick={() => handleCollectionClick(collection)}
            isOwner={true} // Conditionally set to true/false
            // TODO: Implement edit and delete functionality (log for now)
            onEdit={(collection) =>
              console.log("Edit clicked for:", collection)
            }
            onDelete={(collection) =>
              console.log("Delete clicked for:", collection)
            }
          />
        ))}
      </Box>

      {/* Private Collections */}
      {isOwner && (
        <>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              marginTop: "40px",
              marginBottom: "16px",
              textAlign: "center",
              fontFamily: "'Playfair Display', serif", // Decide on the font-family, different for private x public as a DRAFT
            }}
          >
            Private Collections
            <Typography
              component="span"
              sx={{
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: "gray",
                marginLeft: "8px",
              }}
            >
              (Visible only to you)
            </Typography>
          </Typography>
          <Divider sx={{ marginBottom: "16px" }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredPrivateCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleCollectionClick(collection)}
                isOwner={true} // Conditionally set to true/false
                // TODO: Implement edit and delete functionality (log for now)
                onEdit={(collection) =>
                  console.log("Edit clicked for:", collection)
                }
                onDelete={(collection) =>
                  console.log("Delete clicked for:", collection)
                }
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default CollectionsPage;
