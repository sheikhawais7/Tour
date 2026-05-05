import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import ReactMarkdown from 'react-markdown';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Groq from "groq-sdk";

const Agent = () => {
    const [destination, setDestination] = useState('');
    const [response, setResponse] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);


    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [response]);

    const handleInputChange = (e) => {
        setDestination(e.target.value);
    };

    const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_KEY, dangerouslyAllowBrowser: true });

    const handleChat = async () => {
        if (!destination) {
            console.warn("Destination is empty. Please enter a destination.");
            return;
        }
        setLoading(true);
        try {
            const chatCompletion = await getGroqChatCompletion(destination);
            const responseText = chatCompletion.choices[0]?.message?.content || "No response received.";
            setResponse(responseText);
            console.log("Chat response received:", responseText);
            await fetchImages(responseText);
        } catch (error) {
            console.error("Error during chat handling:", error);
            setResponse("Error occurred. Please try again.");
        } finally {
            setDestination("");
            setLoading(false);
        }
    };

    async function getGroqChatCompletion(destination) {
        return groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert travel guide with deep knowledge of cities and destinations worldwide. When asked about a specific place, provide information on top landmarks, must-visit restaurants, unique cultural experiences, and exciting activities." },
                { role: "user", content: `I'm planning a trip to ${destination}. Could you recommend popular landmarks, must-try local foods, famous restaurants, and unique experiences that shouldn't be missed? Please highlight important places.` },
            ],
            model: "llama-3.1-8b-instant",
        });
    }

    const fetchImages = async (text) => {
        const keywords = extractKeywords(text);

        const imagePromises = keywords.map(keyword => fetchImageWithRetry(keyword));
        const imagesData = await Promise.all(imagePromises);

        // Create an array of objects with keyword and imageUrl
        const imagesArray = imagesData.map(item => ({
            keyword: item.keyword.trim(),
            imageUrl: item.imageUrl
        }));

        setImages(imagesArray);
    };


    const fetchImageWithRetry = async (keyword, retries = 3) => {
        const pexelsAccessKey = process.env.REACT_APP_PEXELS_API_KEY; // Pexels API key
        console.log(`Fetching image for keyword: ${keyword}`);
        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, {
                headers: {
                    Authorization: pexelsAccessKey,
                },
            });

            console.log(`Pexels API response for ${keyword}:`, response);
            if (!response.ok) {
                console.error(`Error fetching image for ${keyword}: Status ${response.status}`);
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                const firstResult = data.photos[0];
                console.log(`Image URL found for ${keyword}:`, firstResult.src.original); // Use the original size of the image
                return { keyword, imageUrl: firstResult.src.original || '' }; // Use the highest quality size
            } else {
                console.warn(`No photos found for ${keyword}`);
                return { keyword, imageUrl: '' };
            }
        } catch (error) {
            console.error(`Error fetching image for ${keyword}:`, error);
            if (retries > 0) {
                console.log(`Retrying fetch for ${keyword} (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before retrying
                return fetchImageWithRetry(keyword, retries - 1);
            }
            return { keyword, imageUrl: '' };
        }
    };


    const extractKeywords = (text) => {
        const lines = text.split('\n');
        return lines
            .filter(line => line.startsWith('1.') || line.startsWith('-') || line.includes(':'))
            .map(line => line.replace(/^\d+\.\s|-/, '').trim().split(':')[0]);
    };

    const renderers = {
        listItem: ({ children }) => {
            const keyword = children[0]?.props?.children[0]?.trim() || ''; // Trim for safety
            const imageUrl = images.find(image => image.keyword === keyword)?.imageUrl; // Ensure you fetch the correct image URL

            return (
                <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                    <span>{children}</span>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={keyword}
                            style={{ marginLeft: '10px', maxWidth: '200px', height: 'auto', borderRadius: '12px' }} // Set maxWidth as needed
                            onError={(e) => {
                                console.warn(`Failed to load image for ${keyword}. Error: ${e}`);
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <span style={{ marginLeft: '10px', color: 'red' }}>Image not found</span>
                    )}
                </li>
            );
        },
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleChat();
        }
    };

    return (
        <div className='agent-page'>
            <Link to={"/"}>
                <img src={logo} style={{ width: "60px", margin: "41px 0px 11px 41px", borderRadius: "50%" }} alt="logo" />
            </Link>
            <main>
                <h1 className={`text-center my-3 fw-bolder text-light d-${response.length === 0 ? "block" : "none"}`}>
                    Your Virtual Tour Guide
                </h1>
                <p className={`chat-msg d-${response ? "none" : ""}`} data-aos="fade-right">
                    Hello! How are you? Please tell me your destination to travel.
                </p>
                <div className="chat-container" ref={chatContainerRef}>
                    <ReactMarkdown components={renderers} style={{ color: 'white' }}>{response}</ReactMarkdown>
                </div>

                <div className="input-container">
                    <input
                        type="text"
                        onKeyPress={handleKeyPress}
                        value={destination}
                        onChange={handleInputChange}
                        placeholder="Enter your travel destination..."
                        className="form-control"
                    />
                    <button onClick={handleChat} disabled={loading}>
                        {loading ? <i className="spinner-grow spinner-grow-sm"></i> : "Send"}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Agent;