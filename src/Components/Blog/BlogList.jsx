import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaCommentAlt } from 'react-icons/fa';
import 'animate.css/animate.min.css';
import { useAuth } from "@/pages/authContext";
import { Footer } from "@/widgets/layout/footer";
import TitleBlog from '@/widgets/layout/titleBlog';
import AuthenticationService from "@/Services/Authentification/AuthentificationService";
import Fuse from 'fuse.js';
import Chatbot from './ChatBot';



const BlogList = () => {
    const { authData } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [sortByDate, setSortByDate] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const authenticationService = new AuthenticationService();
    const [userDataMap, setUserDataMap] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
    });



    const postsPerPage = 3;

    const getUserData = (freelancerId) => {
        return new Promise((resolve, reject) => {
            authenticationService.getUserById(freelancerId)
                .then(user => {
                    resolve(user);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    reject(error);
                });
        });
    };

       // Fonction pour exécuter la route de mise à jour dans le backend
       const handleScrape = async () => {
        try {
            const response = await axios.get('https://colabhub.onrender.com/scraping/scrape');
            console.log('Scraping successful:', response.data);
            // Rafraîchir la liste des blogs après la mise à jour
            fetchBlogs();
        } catch (error) {
            console.error('Error scraping:', error);
        }
    };




    const fetchBlogs = async () => {
        try {
            const response = await axios.get('https://colabhub.onrender.com/blogs/Blogs');
            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blog articles:', error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const toggleSortOrder = () => {
        setSortByDate((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const userDataPromises = blogs.map(async (blog) => {
                const userData = await authenticationService.getUserById(blog.userId);
                return userData;
            });
            const userDataArray = await Promise.all(userDataPromises);
            const userDataMap = userDataArray.reduce((acc, user, index) => {
                acc[blogs[index].userId] = user;
                return acc;
            }, {});
            setUserDataMap(userDataMap);
        };
    
        fetchUserData();
    }, [blogs]);

    const sortBlogsByDate = () => {
        return blogs.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
        });
    };

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredByCategory = selectedCategory
        ? filteredBlogs.filter((blog) => blog.category === selectedCategory)
        : filteredBlogs;

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredByCategory.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => setCurrentPage((prevPage) => prevPage + 1);

    const prevPage = () => setCurrentPage((prevPage) => prevPage - 1);


    

    const handleToggleModal = () => {
        if (authData.user) {
            setIsModalOpen(!isModalOpen);
            if (!isModalOpen) {
                setFormData({
                    title: '',
                    description: '',
                    content: '',
                });
            }
        } else {
            console.log("User not authenticated. Redirect or show a message.");
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('https://colabhub.onrender.com/blogs/addBlog', {
                ...formData,
                userId: authData.user._id,
            });
    
            console.log('Blog added successfully:', response.data);
            fetchBlogs();
        } catch (error) {
            console.error('Error adding blog:', error);
        }
    
        handleToggleModal();
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="blog-list-container p-20 mt-10 relative">
            <TitleBlog />

            <img
                src="/img/blogback.jpg"
                alt="Blog Background"
                className="w-full h-[450px] mb-8"
            />
<div className="flex justify-between items-center mb-8">
    <div className="text-3xl font-bold">Latest Blog Posts</div>
    <div className="flex items-center">
        <button
            onClick={toggleSortOrder}
            className="bg-gray-800 p-2 rounded text-white hover:bg-orange-600 mr-4"
        >
            Sort by Date {sortByDate === 'asc' ? 'Ascending' : 'Descending'}
        </button>
        <button
            onClick={handleScrape}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
        >
            Update
        </button>
    </div>
</div>


            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded-md"
                />
            </div>

            <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Filter by Category</label>
<div className="flex flex-wrap gap-2">
    <button
        onClick={() => setSelectedCategory('')}
        className={`border p-2 rounded-md ${selectedCategory === '' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        All
    </button>
    <button
        onClick={() => setSelectedCategory('Web')}
        className={`border p-2 rounded-md ${selectedCategory === 'Web' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Web
    </button>
    <button
        onClick={() => setSelectedCategory('Mobile')}
        className={`border p-2 rounded-md ${selectedCategory === 'Mobile' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Mobile
    </button>
    <button
        onClick={() => setSelectedCategory('Design')}
        className={`border p-2 rounded-md ${selectedCategory === 'Design' ? 'bg-orange-550 text-white' : 'bg-gray-700'}`}
    >
        Design
    </button>
    <button
        onClick={() => setSelectedCategory('Blockchain')}
        className={`border p-2 rounded-md ${selectedCategory === 'Blockchain' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Blockchain
    </button>
    <button
        onClick={() => setSelectedCategory('Cybersecurity')}
        className={`border p-2 rounded-md ${selectedCategory === 'Cybersecurity' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Cybersecurity
    </button>
    <button
        onClick={() => setSelectedCategory('Data Science')}
        className={`border p-2 rounded-md ${selectedCategory === 'Data Science' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Data Science
    </button>
    <button
        onClick={() => setSelectedCategory('Cloud')}
        className={`border p-2 rounded-md ${selectedCategory === 'Cloud' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Cloud
    </button>
    <button
        onClick={() => setSelectedCategory('Other')}
        className={`border p-2 rounded-md ${selectedCategory === 'Other' ? 'bg-orange-500 text-white' : 'bg-gray-700'}`}
    >
        Other
    </button>
</div>


            </div>

            {currentPosts.length > 0 && currentPage === 1 ? (
                <div className="flex">
                    <div className="lg:w-3/4">
                        <ul className="space-y-6">
                            {currentPosts.map((blog) => (
                                <li key={blog._id} className="bg-white rounded-lg p-6 shadow-md">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={userDataMap[blog.userId] && userDataMap[blog.userId].picture ? `https://colabhub.onrender.com/images/${userDataMap[blog.userId].picture}` : '/img/team-1.jpg'}
                                            alt="User"
                                            className="w-10 h-10 rounded-full mr-2"
                                        />
                                        <span className="text-gray-700">
                                            {userDataMap[blog.userId] ? `${userDataMap[blog.userId].nom} ${userDataMap[blog.userId].prenom}` : 'idriss '}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
                                    <p className="text-gray-600">{blog.description}</p>
                                    <p className="text-gray-500 mt-1">Category: {blog.category}</p> {/* Affichage de la catégorie */}
                                    <p className="text-gray-500 mt-2">
                                        Posted on {format(new Date(blog.date), 'MMMM dd, yyyy')}
                                    </p>
                                    <Link to={`/blog/${blog._id}`} className="text-blue-500 hover:underline">
                                        See More
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-center mt-4 border p-4 rounded-lg">
                            <nav>
                                <ul className="pagination flex space-x-2">
                                    <li className="page-item">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`page-link py-2 px-4 rounded ${
                                                currentPage === 1
                                                    ? 'bg-gray-300 text-gray-600'
                                                    : 'bg-white text-orange-500 hover:bg-orange-200'
                                            }`}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({ length: Math.ceil(filteredByCategory.length / postsPerPage) }).map(
                                        (_, index) => (
                                            <li key={index} className="page-item">
                                                <button
                                                    onClick={() => paginate(index + 1)}
                                                    className={`page-link py-2 px-4 rounded ${
                                                        currentPage === index + 1
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-white text-orange-500 hover:bg-orange-200'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        )
                                    )}
                                    <li className="page-item">
                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === Math.ceil(filteredByCategory.length / postsPerPage)}
                                            className={`page-link py-2 px-4 rounded ${
                                                currentPage === Math.ceil(filteredByCategory.length / postsPerPage)
                                                    ? 'bg-gray-300 text-gray-600'
                                                    : 'bg-white text-orange-500 hover:bg-orange-200'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    <div className="lg:w-1/4 ml-4">
                        <iframe
                            title="YouTube Video"
                            width="100%"
                            height="315"
                            src="https://www.youtube.com/embed/SqcY0GlETPk?si=HF_vflDAmaCzFh5S"
                            frameBorder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            ) : (
                <div>
                    {currentPosts.length > 0 ? (
                        <ul className="space-y-6">
                        {currentPosts.map((blog) => (
    <li key={blog._id} className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-4">
            <img
                src={userDataMap[blog.userId] && userDataMap[blog.userId].picture ? `https://colabhub.onrender.com/images/${userDataMap[blog.userId].picture}` : '/img/team-1.jpg'}
                alt="User"
                className="w-10 h-10 rounded-full mr-2"
            />
            <span className="text-gray-700">
                {userDataMap[blog.userId] ? `${userDataMap[blog.userId].nom} ${userDataMap[blog.userId].prenom}` : 'idriss '}
            </span>
        </div>
        <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
        <p className="text-gray-600">{blog.description}</p>
        <p className="text-gray-500 mt-1">Category: {blog.category}</p> {/* Affichage de la catégorie */}
        <p className="text-gray-500 mt-1">
            Posted on {format(new Date(blog.date), 'MMMM dd, yyyy')}
        </p>
        <Link to={`/blog/${blog._id}`} className="text-blue-500 hover:underline">
            See More
        </Link>
    </li>
))}

                        </ul>
                    ) : (
                        <p className="text-gray-600">No blog posts available at the moment.</p>
                    )}

                    <div className="flex justify-center mt-4 border p-4 rounded-lg">
                        <nav>
                            <ul className="pagination flex space-x-2">
                                <li className="page-item">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className={`page-link py-2 px-4 rounded ${
                                            currentPage === 1
                                                ? 'bg-gray-300 text-gray-600'
                                                : 'bg-white text-orange-500 hover:bg-orange-200'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: Math.ceil(filteredByCategory.length / postsPerPage) }).map(
                                    (_, index) => (
                                        <li key={index} className="page-item">
                                            <button
                                                onClick={() => paginate(index + 1)}
                                                className={`page-link py-2 px-4 rounded ${
                                                    currentPage === index + 1
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white text-orange-500 hover:bg-orange-200'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    )
                                )}
                                <li className="page-item">
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === Math.ceil(filteredByCategory.length / postsPerPage)}
                                        className={`page-link py-2 px-4 rounded ${
                                            currentPage === Math.ceil(filteredByCategory.length / postsPerPage)
                                                ? 'bg-gray-300 text-gray-600'
                                                : 'bg-white text-orange-500 hover:bg-orange-200'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            <div className="fixed bottom-5 right-3">
                <a
                    href="#"
                    onClick={handleToggleModal}
                    className="bg-orange-500 p-4 rounded-full text-white hover:bg-orange-600"
                    style={{ position: 'fixed', bottom: '30px', right: '100px' }}
                >
                    <FaCommentAlt size={24} />
                </a>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-8 max-w-2xl w-full rounded-md flex">
                        <div className="w-full">
                            <img
                                src="/img/blog-f.jpg"
                                alt="Blog Image"
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                        <div className="w-full ml-4">
                            <h2 className="text-2xl font-semibold mb-4">Add a Blog</h2>
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-600">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="mt-1 p-2 border rounded-md w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="mt-1 p-2 border rounded-md w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-600">
                                        Content
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleFormChange}
                                        className="mt-1 p-2 border rounded-md w-full"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleToggleModal}
                                        className="mr-2 px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 rounded-md text-white hover:bg-orange-600"
                                    >
                                        Add Blog
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
        
    );
};

export default BlogList;
